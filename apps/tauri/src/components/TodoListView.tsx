import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { 
  Check, 
  Trash2, 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle
} from "lucide-react";
import { db, type LocalTodo } from "../lib/db";
import { syncAll } from "../lib/sync";

export function TodoListView() {
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("personal");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("pending");

  // Fetch non-deleted todos from Dexie
  const todos = useLiveQuery(async () => {
    return db.todos.where("deleted").equals(0).toArray();
  });

  const filteredTodos = (todos || []).filter((todo) => {
    const matchCategory = filterCategory === "all" || todo.category === filterCategory;
    const matchPriority = filterPriority === "all" || todo.priority === filterPriority;
    const matchStatus = filterStatus === "all" || todo.status === filterStatus;
    return matchCategory && matchPriority && matchStatus;
  }).sort((a, b) => {
    // Sort completed to the bottom, then by priority (high first), then by creation date
    if (a.status !== b.status) {
      return a.status === "done" ? 1 : -1;
    }
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    const weightA = priorityWeights[a.priority] || 2;
    const weightB = priorityWeights[b.priority] || 2;
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const nowStr = new Date().toISOString();
    const todoData: LocalTodo = {
      id: `local_${crypto.randomUUID()}`,
      title: newTitle.trim(),
      description: "",
      content: "",
      category: newCategory,
      priority: newPriority,
      status: "pending",
      dueDate: newDueDate || undefined,
      timeOfDay: newTime ? `${newTime}:00` : undefined,
      createdAt: nowStr,
      updatedAt: nowStr,
      deleted: 0,
      syncStatus: "pending",
    };

    await db.todos.put(todoData);
    setNewTitle("");
    setNewDueDate("");
    setNewTime("");
    
    // Trigger sync
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

  const handleDeleteTodo = async (id: string) => {
    const localTodo = await db.todos.get(id);
    if (!localTodo) return;

    if (id.startsWith("local_")) {
      // If it was created locally and never synced, we can delete it permanently
      await db.todos.delete(id);
    } else {
      // Soft delete and mark pending sync
      await db.todos.update(id, {
        deleted: 1,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
    }
    syncAll().catch(console.error);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Todo Creator Form */}
      <div className="w-full md:w-80 flex-shrink-0 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl space-y-4">
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          Thêm công việc mới
        </h3>

        <form onSubmit={handleAddTodo} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Tên công việc</label>
            <input
              type="text"
              placeholder="Học tiếng Anh, chạy bộ..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Danh mục</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-2 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition text-sm"
              >
                <option value="personal">🏠 Cá nhân</option>
                <option value="work">💼 Công việc</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Độ ưu tiên</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-2 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition text-sm"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Hạn chót
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Thời gian
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm mt-2 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo công việc
          </button>
        </form>
      </div>

      {/* Todo List Content */}
      <div className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/5 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">Bộ lọc</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Status filters */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-white/5">
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  filterStatus === "pending" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Chưa làm
              </button>
              <button
                onClick={() => setFilterStatus("done")}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  filterStatus === "done" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Đã xong
              </button>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  filterStatus === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tất cả
              </button>
            </div>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2 py-1 bg-slate-800 border border-white/5 rounded-lg text-slate-300 focus:outline-none"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="personal">Cá nhân</option>
              <option value="work">Công việc</option>
            </select>

            {/* Priority filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2 py-1 bg-slate-800 border border-white/5 rounded-lg text-slate-300 focus:outline-none"
            >
              <option value="all">Mọi độ ưu tiên</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>
        </div>

        {/* Todos list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-slate-800/40 hover:bg-slate-800/60 transition-all ${
                  todo.status === "done" ? "opacity-60 bg-slate-900/20" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTodo(todo)}
                    className="mt-0.5 text-slate-400 hover:text-white transition-all flex-shrink-0"
                  >
                    {todo.status === "done" ? (
                      <Check className="w-4 h-4 text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 rounded-md p-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-md border border-slate-500 hover:border-indigo-400 transition" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-semibold text-white truncate ${
                      todo.status === "done" ? "line-through text-slate-500" : ""
                    }`}>
                      {todo.title}
                    </h4>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                        {todo.category === "work" ? "💼 Work" : "🏠 Cá nhân"}
                      </span>

                      <span className={`px-1.5 py-0.5 rounded-md font-medium ${
                        todo.priority === "high"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : todo.priority === "medium"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {todo.priority}
                      </span>

                      {todo.dueDate && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <CalendarIcon className="w-3 h-3 text-indigo-400" />
                          {todo.dueDate}
                        </span>
                      )}

                      {todo.timeOfDay && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          {todo.timeOfDay.slice(0, 5)}
                        </span>
                      )}

                      {todo.syncStatus === "pending" && (
                        <span className="px-1 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-[8px] uppercase tracking-wider animate-pulse">
                          Unsynced
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Xoá công việc"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm">Không tìm thấy công việc nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
