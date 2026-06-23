import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Eye, 
  Edit3 
} from "lucide-react";
import { db, type LocalNote } from "../lib/db";
import { syncAll } from "../lib/sync";

export function QuickNotesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const saveTimeoutRef = useRef<any>(null);

  // Fetch non-deleted notes
  const notes = useLiveQuery(async () => {
    return db.notes.where("deleted").equals(0).toArray();
  });

  const filteredNotes = (notes || []).filter((note) => {
    return note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (note.content || "").toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const selectedNote = (notes || []).find((n) => n.id === selectedNoteId);

  // Load selected note values into local edit state
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content || "");
      setSaveStatus("saved");
    } else {
      setEditTitle("");
      setEditContent("");
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  // Handle auto-saving on content or title change
  const handleContentChange = (contentVal: string) => {
    setEditContent(contentVal);
    triggerAutoSave(editTitle, contentVal);
  };

  const handleTitleChange = (titleVal: string) => {
    setEditTitle(titleVal);
    triggerAutoSave(titleVal, editContent);
  };

  const triggerAutoSave = (title: string, content: string) => {
    if (!selectedNoteId) return;
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const nowStr = new Date().toISOString();
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      await db.notes.update(selectedNoteId, {
        title: title || "Ghi chú không tên",
        slug: slug || "untitled",
        content,
        updatedAt: nowStr,
        syncStatus: "pending",
      });

      setSaveStatus("saved");
      // Trigger background sync
      syncAll().catch(console.error);
    }, 1000); // 1 second debounce
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleCreateNote = async () => {
    const nowStr = new Date().toISOString();
    const newNote: LocalNote = {
      id: `local_${crypto.randomUUID()}`,
      title: "Ghi chú mới",
      slug: "new-note",
      content: "",
      position: 0,
      isPublished: 0,
      createdAt: nowStr,
      updatedAt: nowStr,
      deleted: 0,
      syncStatus: "pending",
    };

    await db.notes.put(newNote);
    setSelectedNoteId(newNote.id);
    
    // Trigger sync
    syncAll().catch(console.error);
  };

  const handleDeleteNote = async () => {
    if (!selectedNoteId) return;

    if (selectedNoteId.startsWith("local_")) {
      await db.notes.delete(selectedNoteId);
    } else {
      await db.notes.update(selectedNoteId, {
        deleted: 1,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
    }

    setSelectedNoteId(null);
    syncAll().catch(console.error);
  };

  return (
    <div className="flex h-full bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Left Sidebar - Note List */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-slate-950/20">
        {/* Search & Actions Header */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
            />
          </div>

          <button
            onClick={handleCreateNote}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Tạo ghi chú
          </button>
        </div>

        {/* Note Item List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border border-transparent ${
                selectedNoteId === note.id
                  ? "bg-indigo-600/25 border-indigo-500/30 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold truncate text-white">{note.title || "Ghi chú không tên"}</h4>
                <p className="text-xs text-slate-500 truncate mt-1">
                  {note.content || "Chưa có nội dung"}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500">
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {note.syncStatus === "pending" && (
                    <span className="text-yellow-500/80 animate-pulse">Unsynced</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Content - Note Editor */}
      <div className="flex-1 flex flex-col bg-slate-900/10">
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/30">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    saveStatus === "saving" ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
                  }`} />
                  {saveStatus === "saving" ? "Đang lưu..." : "Đã lưu locally"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  title={isPreview ? "Edit note" : "Preview markdown"}
                >
                  {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDeleteNote}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Editor Workspace */}
            <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
              <input
                type="text"
                placeholder="Tiêu đề ghi chú..."
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-0 py-2 bg-transparent text-xl font-bold text-white placeholder-slate-600 border-none focus:outline-none focus:ring-0"
              />

              {isPreview ? (
                // Markdown Preview Mode
                <div className="flex-1 overflow-y-auto prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap leading-relaxed bg-slate-800/20 border border-white/5 rounded-xl p-4">
                  {editContent || <span className="text-slate-600 italic">Trống</span>}
                </div>
              ) : (
                // Text Editor Mode
                <textarea
                  placeholder="Bắt đầu viết ghi chú bằng Markdown..."
                  value={editContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="flex-1 w-full bg-transparent border-none text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-0 resize-none leading-relaxed text-sm"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-sm">Chọn hoặc tạo một ghi chú để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
