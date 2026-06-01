import { db } from "./db";
import { trpcRequest } from "./trpc";

let isSyncing = false;

export interface SyncStatus {
  status: "idle" | "syncing" | "success" | "error";
  lastSyncTime?: Date;
  errorMessage?: string;
}

type SyncCallback = (status: SyncStatus) => void;
const listeners = new Set<SyncCallback>();

export function addSyncListener(callback: SyncCallback) {
  listeners.add(callback);
}

export function removeSyncListener(callback: SyncCallback) {
  listeners.delete(callback);
}

function notifyListeners(status: SyncStatus) {
  listeners.forEach((listener) => listener(status));
}

// Format Date helper
function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function syncAll(): Promise<void> {
  if (isSyncing) return;
  isSyncing = true;
  notifyListeners({ status: "syncing" });

  try {
    // 1. Sync Daily Routines
    await syncRoutines();

    // 2. Sync Routine Logs (for the last 7 days to keep recent logs fresh)
    await syncRecentRoutineLogs();

    // 3. Sync Todos (Tasks)
    await syncTodos();

    // 4. Sync Notes (Wiki Pages)
    await syncNotes();

    const now = new Date();
    await db.syncMetadata.put({ key: "lastSyncTime", value: now.toISOString() });
    
    isSyncing = false;
    notifyListeners({ status: "success", lastSyncTime: now });
  } catch (error: any) {
    console.error("Sync failed:", error);
    isSyncing = false;
    notifyListeners({
      status: "error",
      errorMessage: error.message || "Failed to synchronize data",
    });
  }
}

// 1. ROUTINES SYNC
async function syncRoutines() {
  // PUSH local pending routines
  const pendingLocal = await db.routines.where("syncStatus").equals("pending").toArray();
  for (const local of pendingLocal) {
    if (local.deleted === 1) {
      // If it has a server ID, delete it on the server
      if (!local.id.startsWith("local_")) {
        await trpcRequest("todo.deleteDailyRoutine", "POST", local.id);
      }
      await db.routines.delete(local.id);
    } else {
      if (local.id.startsWith("local_")) {
        // Create on server
        const { id: _, syncStatus: __, ...createInput } = local;
        const serverRoutine = await trpcRequest<any>("todo.createDailyRoutine", "POST", {
          ...createInput,
          active: local.active === 1,
        });
        // Swap local temporary ID with server ID
        await db.routines.delete(local.id);
        await db.routines.put({
          ...local,
          id: serverRoutine.id,
          syncStatus: "synced",
        });
      } else {
        // Update on server
        const { syncStatus: _, deleted: __, ...updateInput } = local;
        await trpcRequest("todo.updateDailyRoutine", "POST", {
          ...updateInput,
          active: local.active === 1,
        });
        await db.routines.update(local.id, { syncStatus: "synced" });
      }
    }
  }

  // PULL server routines
  const serverResponse = await trpcRequest<any>("todo.getDailyRoutines", "GET", { limit: 1000 });
  const serverRoutines = serverResponse.data || [];
  
  const serverIds = new Set<string>();

  for (const server of serverRoutines) {
    serverIds.add(server.id);
    const local = await db.routines.get(server.id);

    if (!local) {
      // Insert new
      await db.routines.put({
        id: server.id,
        title: server.title,
        description: server.description || "",
        timeOfDay: server.timeOfDay || undefined,
        daysOfWeek: server.daysOfWeek,
        priority: server.priority,
        active: server.active ? 1 : 0,
        orderIndex: server.orderIndex,
        color: server.color || undefined,
        icon: server.icon || undefined,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
        deleted: 0,
        syncStatus: "synced",
      });
    } else if (local.syncStatus === "synced") {
      // Server is source of truth if client is already synced
      if (new Date(server.updatedAt).getTime() > new Date(local.updatedAt).getTime()) {
        await db.routines.update(server.id, {
          title: server.title,
          description: server.description || "",
          timeOfDay: server.timeOfDay || undefined,
          daysOfWeek: server.daysOfWeek,
          priority: server.priority,
          active: server.active ? 1 : 0,
          orderIndex: server.orderIndex,
          color: server.color || undefined,
          icon: server.icon || undefined,
          updatedAt: server.updatedAt,
        });
      }
    }
  }

  // Clean up local items that were deleted from server
  const localRoutines = await db.routines.toArray();
  for (const local of localRoutines) {
    if (!local.id.startsWith("local_") && !serverIds.has(local.id) && local.syncStatus === "synced") {
      await db.routines.delete(local.id);
    }
  }
}

// 2. ROUTINE LOGS SYNC
async function syncRecentRoutineLogs() {
  // PUSH local pending logs
  const pendingLogs = await db.routineLogs.where("syncStatus").equals("pending").toArray();
  for (const log of pendingLogs) {
    if (log.deleted === 1) {
      // Server has no deleteRoutineLog procedure, so we soft-delete locally
      await db.routineLogs.delete(log.id);
    } else {
      // Log routine log to server
      await trpcRequest("todo.logDailyRoutine", "POST", {
        routineId: log.routineId,
        date: log.date,
        status: log.status,
        note: log.note || undefined,
      });
      await db.routineLogs.update(log.id, { syncStatus: "synced" });
    }
  }

  // PULL logs for the last 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - i);
    const dateStr = toISODate(targetDate);

    // Call getDailyRoutines with onDate, which embeds statusForDate
    const response = await trpcRequest<any>("todo.getDailyRoutines", "GET", {
      limit: 1000,
      onDate: dateStr,
    });
    
    const routines = response.data || [];
    for (const r of routines) {
      if (r.statusForDate) {
        // Find existing local log for this routine and date
        const existingLog = await db.routineLogs
          .where("[routineId+date]")
          .equals([r.id, dateStr])
          .first();

        if (!existingLog || existingLog.syncStatus === "synced") {
          // Put log into IndexedDB
          await db.routineLogs.put({
            id: existingLog?.id || crypto.randomUUID(),
            routineId: r.id,
            date: dateStr,
            status: r.statusForDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deleted: 0,
            syncStatus: "synced",
          });
        }
      }
    }
  }
}

// 3. TODOS SYNC
async function syncTodos() {
  // PUSH local pending todos
  const pendingLocal = await db.todos.where("syncStatus").equals("pending").toArray();
  for (const local of pendingLocal) {
    if (local.deleted === 1) {
      if (!local.id.startsWith("local_")) {
        await trpcRequest("tasks.delete", "POST", local.id);
      }
      await db.todos.delete(local.id);
    } else {
      // Map Dexie fields to database columns
      // Note: we use dayjs custom formats or Date strings for the backend
      const taskPayload = {
        title: local.title,
        description: local.description || null,
        content: local.content || null,
        type_code: local.category === "work" ? "task" : "task", // default to task
        status_code: local.status === "done" ? "completed" : "todo",
        priority_code: local.priority,
        due_date: local.dueDate ? local.dueDate : null,
      };

      if (local.id.startsWith("local_")) {
        // Create
        const serverTodo = await trpcRequest<any>("tasks.create", "POST", taskPayload);
        await db.todos.delete(local.id);
        await db.todos.put({
          ...local,
          id: serverTodo.id,
          syncStatus: "synced",
        });
      } else {
        // Update
        await trpcRequest("tasks.update", "POST", {
          id: local.id,
          ...taskPayload,
        });
        await db.todos.update(local.id, { syncStatus: "synced" });
      }
    }
  }

  // PULL server todos
  const serverTodos = await trpcRequest<any[]>("tasks.all", "GET");
  const serverIds = new Set<string>();

  for (const server of serverTodos) {
    serverIds.add(server.id);
    const local = await db.todos.get(server.id);

    if (!local) {
      // Insert new local todo
      await db.todos.put({
        id: server.id,
        title: server.title,
        description: server.description || "",
        content: server.content || "",
        category: server.project_slug ? "work" : "personal",
        priority: server.priority_code || "medium",
        status: server.status_code === "completed" ? "done" : "pending",
        dueDate: server.due_date ? toISODate(new Date(server.due_date)) : undefined,
        createdAt: server.created_at,
        updatedAt: server.updated_at,
        deleted: 0,
        syncStatus: "synced",
      });
    } else if (local.syncStatus === "synced") {
      // Overwrite if server is newer
      if (new Date(server.updated_at).getTime() > new Date(local.updatedAt).getTime()) {
        await db.todos.update(server.id, {
          title: server.title,
          description: server.description || "",
          content: server.content || "",
          category: server.project_slug ? "work" : "personal",
          priority: server.priority_code || "medium",
          status: server.status_code === "completed" ? "done" : "pending",
          dueDate: server.due_date ? toISODate(new Date(server.due_date)) : undefined,
          updatedAt: server.updated_at,
        });
      }
    }
  }

  // Clean up deleted on server
  const localTodos = await db.todos.toArray();
  for (const local of localTodos) {
    if (!local.id.startsWith("local_") && !serverIds.has(local.id) && local.syncStatus === "synced") {
      await db.todos.delete(local.id);
    }
  }
}

// 4. NOTES SYNC
async function syncNotes() {
  // PUSH local pending notes
  const pendingLocal = await db.notes.where("syncStatus").equals("pending").toArray();
  for (const local of pendingLocal) {
    if (local.deleted === 1) {
      if (!local.id.startsWith("local_")) {
        await trpcRequest("notes.delete", "POST", local.id);
      }
      await db.notes.delete(local.id);
    } else {
      const notePayload = {
        title: local.title,
        slug: local.slug,
        content: local.content || "",
        parentPageId: local.parentPageId || null,
        isPublished: local.isPublished === 1,
        position: local.position,
      };

      if (local.id.startsWith("local_")) {
        // Create
        const serverNote = await trpcRequest<any>("notes.create", "POST", notePayload);
        await db.notes.delete(local.id);
        await db.notes.put({
          ...local,
          id: serverNote.id,
          syncStatus: "synced",
        });
      } else {
        // Update
        await trpcRequest("notes.update", "POST", {
          id: local.id,
          ...notePayload,
        });
        await db.notes.update(local.id, { syncStatus: "synced" });
      }
    }
  }

  // PULL server notes
  const serverNotes = await trpcRequest<any[]>("notes.getTree", "GET");
  const serverIds = new Set<string>();

  for (const server of serverNotes) {
    serverIds.add(server.id);
    const local = await db.notes.get(server.id);

    if (!local) {
      await db.notes.put({
        id: server.id,
        title: server.title,
        slug: server.slug,
        content: server.content || "",
        parentPageId: server.parentPageId || undefined,
        isPublished: server.isPublished ? 1 : 0,
        position: server.position || 0,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
        deleted: 0,
        syncStatus: "synced",
      });
    } else if (local.syncStatus === "synced") {
      if (new Date(server.updatedAt).getTime() > new Date(local.updatedAt).getTime()) {
        await db.notes.update(server.id, {
          title: server.title,
          slug: server.slug,
          content: server.content || "",
          parentPageId: server.parentPageId || undefined,
          isPublished: server.isPublished ? 1 : 0,
          position: server.position || 0,
          updatedAt: server.updatedAt,
        });
      }
    }
  }

  // Clean up deleted notes
  const localNotes = await db.notes.toArray();
  for (const local of localNotes) {
    if (!local.id.startsWith("local_") && !serverIds.has(local.id) && local.syncStatus === "synced") {
      await db.notes.delete(local.id);
    }
  }
}
