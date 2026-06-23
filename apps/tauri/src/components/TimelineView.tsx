import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { 
  Check,
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle
} from "lucide-react";
import { db, type LocalTodo, type LocalRoutineLog } from "../lib/db";
import { syncAll } from "../lib/sync";

export function TimelineView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = selectedDate.toISOString().split("T")[0];
  const dayIndex = selectedDate.getDay();
  const dow = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayIndex];

  // 1. Fetch routines active for this day of the week
  const routines = useLiveQuery(async () => {
    const allRoutines = await db.routines.where("deleted").equals(0).toArray();
    return allRoutines
      .filter((r) => r.active === 1 && r.daysOfWeek.includes(dow))
      .sort((a, b) => {
        if (!a.timeOfDay) return 1;
        if (!b.timeOfDay) return -1;
        return a.timeOfDay.localeCompare(b.timeOfDay);
      });
  }, [dow]);

  // 2. Fetch logs for these routines on this date
  const logs = useLiveQuery(async () => {
    return db.routineLogs.where("date").equals(dateStr).toArray();
  }, [dateStr]);

  // 3. Fetch todos due on this date OR in category "work" (which should show in timeline)
  const todos = useLiveQuery(async () => {
    const allTodos = await db.todos.where("deleted").equals(0).toArray();
    return allTodos.filter(
      (t) => t.dueDate === dateStr || (t.category === "work" && t.status === "pending")
    ).sort((a, b) => {
      if (!a.timeOfDay) return 1;
      if (!b.timeOfDay) return -1;
      return a.timeOfDay.localeCompare(b.timeOfDay);
    });
  }, [dateStr]);

  // Map routine logs by routineId for quick lookup
  const logsMap = new Map<string, LocalRoutineLog>(
    (logs || []).map((l) => [l.routineId, l])
  );

  // Helper to log/toggle routine status
  const handleLogRoutine = async (routineId: string, status: "done" | "skipped" | "snoozed") => {
    const existing = logsMap.get(routineId);
    const nowStr = new Date().toISOString();

    const logData: LocalRoutineLog = {
      id: existing?.id || crypto.randomUUID(),
      routineId,
      date: dateStr,
      status,
      note: "",
      completedAt: status === "done" ? nowStr : undefined,
      createdAt: existing?.createdAt || nowStr,
      updatedAt: nowStr,
      deleted: 0,
      syncStatus: "pending",
    };

    await db.routineLogs.put(logData);
    // Trigger background sync
    syncAll().catch(console.error);
  };

  const handleToggleTodo = async (todo: LocalTodo) => {
    const newStatus = todo.status === "done" ? "pending" : "done";
    await db.todos.update(todo.id, {
      status: newStatus,
      completedAt: newStatus === "done" ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
    });
    syncAll().catch(console.error);
  };

  // Adjust date
  const shiftDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + days);
    setSelectedDate(next);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Build timeline hours from 06:00 to 23:00
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Group events (routines & todos) by hour
  const getEventsForHour = (hour: number) => {
    const pad = (num: number) => String(num).padStart(2, "0");
    const hourStr = `${pad(hour)}:`;

    const hourRoutines = (routines || []).filter((r) => r.timeOfDay && r.timeOfDay.startsWith(hourStr));
    const hourTodos = (todos || []).filter((t) => t.timeOfDay && t.timeOfDay.startsWith(hourStr));

    return {
      routines: hourRoutines,
      todos: hourTodos,
    };
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Date Header Selector */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">
            {selectedDate.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          {isToday(selectedDate) && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              Hôm nay
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition"
          >
            Hôm nay
          </button>
          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main timeline scrollable container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="relative border-l border-white/10 ml-12 pl-6 space-y-8">
          {hours.map((hour) => {
            const hourFormatted = `${String(hour).padStart(2, "0")}:00`;
            const { routines: hrRoutines, todos: hrTodos } = getEventsForHour(hour);
            const hasEvents = hrRoutines.length > 0 || hrTodos.length > 0;

            return (
              <div key={hour} className="relative group">
                {/* Hour badge marker on the left line */}
                <div className="absolute -left-18 top-1 text-xs font-medium text-slate-400 w-12 text-right">
                  {hourFormatted}
                </div>
                
                {/* Visual dot on the timeline axis */}
                <div className={`absolute left-[-30px] top-2 w-3 h-3 rounded-full border-2 transition-all ${
                  hasEvents 
                    ? "bg-indigo-400 border-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" 
                    : "bg-slate-900 border-slate-700 group-hover:border-slate-500"
                }`} />

                {/* Event Cards inside the hour block */}
                <div className="space-y-3">
                  {hasEvents ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Routines Column */}
                      {hrRoutines.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Routines</div>
                          {hrRoutines.map((routine) => {
                            const log = logsMap.get(routine.id);
                            const status = log?.status;

                            return (
                              <div 
                                key={routine.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  status === "done"
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                                    : status === "skipped"
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-100 opacity-60"
                                    : "bg-white/5 border-white/10 hover:border-white/20 text-white"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs text-indigo-300 font-semibold">{routine.timeOfDay?.slice(0, 5)}</span>
                                      <h4 className="text-sm font-semibold">{routine.title}</h4>
                                    </div>
                                    {routine.description && (
                                      <p className="text-xs text-slate-400 mt-1">{routine.description}</p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleLogRoutine(routine.id, "done")}
                                      className={`p-1 rounded-md transition ${
                                        status === "done" 
                                          ? "bg-emerald-500 text-white" 
                                          : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                                      }`}
                                      title="Mark completed"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleLogRoutine(routine.id, "skipped")}
                                      className={`p-1 rounded-md transition ${
                                        status === "skipped" 
                                          ? "bg-rose-500 text-white" 
                                          : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                                      }`}
                                      title="Skip routine"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Scheduled Todos Column */}
                      {hrTodos.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Công việc</div>
                          {hrTodos.map((todo) => (
                            <div 
                              key={todo.id}
                              className={`p-3 rounded-xl border bg-white/5 border-white/10 hover:border-white/20 transition-all ${
                                todo.status === "done" ? "opacity-60 bg-slate-900/50" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <button
                                  onClick={() => handleToggleTodo(todo)}
                                  className="mt-0.5 text-slate-400 hover:text-white transition"
                                >
                                  {todo.status === "done" ? (
                                    <Check className="w-4 h-4 text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 rounded-md p-0.5" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-md border border-slate-500" />
                                  )}
                                </button>

                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5">
                                    {todo.timeOfDay && (
                                      <span className="text-xs text-indigo-300 font-semibold">{todo.timeOfDay.slice(0, 5)}</span>
                                    )}
                                    <h4 className={`text-sm font-semibold text-white ${
                                      todo.status === "done" ? "line-through text-slate-500" : ""
                                    }`}>
                                      {todo.title}
                                    </h4>
                                  </div>
                                  {todo.description && (
                                    <p className="text-xs text-slate-400 mt-1">{todo.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-400 rounded-md">
                                      {todo.category === "work" ? "💼 Work" : "🏠 Personal"}
                                    </span>
                                    <span className={`px-1.5 py-0.5 text-[9px] rounded-md ${
                                      todo.priority === "high" 
                                        ? "bg-rose-500/20 text-rose-300" 
                                        : todo.priority === "medium"
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-slate-800 text-slate-400"
                                    }`}>
                                      {todo.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Placeholder when no events exist in this hour block
                    <div className="py-2 text-xs text-slate-600 italic group-hover:text-slate-500 transition">
                      Trống
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
