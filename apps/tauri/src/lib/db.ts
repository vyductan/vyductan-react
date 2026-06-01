import Dexie, { type Table } from "dexie";

export interface LocalTodo {
  id: string; // UUID v4 primary key
  title: string;
  description: string;
  content: string;
  category: string; // "work", "personal", etc. or category_id
  priority: "low" | "medium" | "high";
  status: "pending" | "done";
  dueDate?: string; // YYYY-MM-DD
  timeOfDay?: string; // HH:MM:SS
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deleted: number; // 0 = active, 1 = deleted (soft delete for sync)
  syncStatus: "synced" | "pending";
}

export interface LocalRoutine {
  id: string;
  title: string;
  description: string;
  timeOfDay?: string; // HH:MM:SS
  daysOfWeek: string[]; // ["mon", "tue", ...]
  priority: "low" | "medium" | "high";
  active: number; // 0 = inactive, 1 = active
  orderIndex: number;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  syncStatus: "synced" | "pending";
}

export interface LocalRoutineLog {
  id: string;
  routineId: string;
  date: string; // YYYY-MM-DD
  status: "done" | "skipped" | "snoozed";
  note?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  syncStatus: "synced" | "pending";
}

export interface LocalNote {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentPageId?: string;
  isPublished: number; // 0 = draft, 1 = published
  position: number;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  syncStatus: "synced" | "pending";
}

export interface SyncMetadata {
  key: string; // "lastSyncTime", "sessionToken", etc.
  value: string;
}

export class LocalDatabase extends Dexie {
  todos!: Table<LocalTodo>;
  routines!: Table<LocalRoutine>;
  routineLogs!: Table<LocalRoutineLog>;
  notes!: Table<LocalNote>;
  syncMetadata!: Table<SyncMetadata>;

  constructor() {
    super("TauriSyncLocalDB");
    this.version(1).stores({
      todos: "id, title, priority, status, deleted, syncStatus",
      routines: "id, title, timeOfDay, deleted, syncStatus",
      routineLogs: "id, routineId, date, status, deleted, syncStatus",
      notes: "id, title, slug, parentPageId, deleted, syncStatus",
      syncMetadata: "key",
    });
  }
}

export const db = new LocalDatabase();
