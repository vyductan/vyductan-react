import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  CheckSquare, 
  FileText, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  LogOut, 
  Clock,
  Key
} from "lucide-react";
import { 
  getSessionToken, 
  setSessionToken, 
  clearSessionToken, 
  triggerBrowserLogin 
} from "./lib/auth";
import { syncAll, addSyncListener, removeSyncListener, type SyncStatus } from "./lib/sync";
import { TimelineView } from "./components/TimelineView";
import { TodoListView } from "./components/TodoListView";
import { QuickNotesView } from "./components/QuickNotesView";
import { startNotificationScheduler, stopNotificationScheduler } from "./lib/notifications";

function App() {
  const [activeTab, setActiveTab] = useState<"timeline" | "todos" | "notes" | "settings">("timeline");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authInputToken, setAuthInputToken] = useState("");
  const [authError, setAuthError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: "idle" });

  // Initialize notification scheduler
  useEffect(() => {
    startNotificationScheduler();
    return () => stopNotificationScheduler();
  }, []);

  // 1. Check Auth Status on Startup
  useEffect(() => {
    async function checkAuth() {
      const token = await getSessionToken();
      if (token) {
        setIsAuthenticated(true);
        // Trigger initial sync
        syncAll().catch(console.error);
      } else {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Listen to Sync Status Updates
  useEffect(() => {
    const handleSyncChange = (status: SyncStatus) => {
      setSyncStatus(status);
    };
    addSyncListener(handleSyncChange);
    return () => removeSyncListener(handleSyncChange);
  }, []);

  // 3. Monitor Online/Offline Status
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      syncAll().catch(console.error);
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // 4. Listen to custom scheme redirects (Deep Link fallback parsing)
  // Since we might not have native deep link listener enabled yet, the user can paste the redirect token directly.
  const handleVerifyPastedToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    let cleanedToken = authInputToken.trim();
    
    // If user pasted the whole URL (e.g. vyductan-dev://callback?token=XYZ)
    if (cleanedToken.includes("token=")) {
      try {
        const urlParams = new URLSearchParams(cleanedToken.split("?")[1]);
        const parsedToken = urlParams.get("token");
        if (parsedToken) {
          cleanedToken = parsedToken;
        }
      } catch (err) {
        setAuthError("Không thể phân tích token từ URL.");
        return;
      }
    }

    if (!cleanedToken) {
      setAuthError("Token không được để trống.");
      return;
    }

    try {
      // Save token and check
      await setSessionToken(cleanedToken);
      setIsAuthenticated(true);
      setAuthInputToken("");
      // Sync immediately
      await syncAll();
    } catch (err) {
      console.error(err);
      setAuthError("Xác minh thất bại. Token có thể đã hết hạn.");
      await clearSessionToken();
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await clearSessionToken();
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Đang kiểm tra thông tin đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white font-sans selection:bg-indigo-500 selection:text-white">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6 relative">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <Calendar className="w-7 h-7 text-indigo-400" />
              VyDucTan Dev Plan
            </h1>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Lập lịch cố định, danh sách việc linh hoạt và ghi chú nhanh offline-first.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={triggerBrowserLogin}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Key className="w-4 h-4" />
              Đăng nhập qua Trình duyệt
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-slate-600 text-xs uppercase tracking-wider font-bold">HOẶC NHẬP TOKEN</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <form onSubmit={handleVerifyPastedToken} className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Nếu trình duyệt không tự động chuyển hướng hoặc báo lỗi giao thức, vui lòng sao chép toàn bộ đường dẫn address bar (chứa token) và dán vào đây:
                </p>
                <input
                  type="text"
                  placeholder="vyductan-dev://callback?token=..."
                  value={authInputToken}
                  onChange={(e) => setAuthInputToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition text-xs"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-400 text-center font-medium bg-rose-500/10 py-1.5 rounded-lg border border-rose-500/20">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 font-semibold rounded-xl text-xs transition border border-white/5"
              >
                Xác minh & Kết nối
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background glow lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-slate-900/60 backdrop-blur-md border-r border-white/5 p-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="p-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-md font-bold tracking-wider text-white">VYDUCTAN PLAN</h1>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "timeline"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              Lịch cố định (Timeline)
            </button>

            <button
              onClick={() => setActiveTab("todos")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "todos"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Việc linh hoạt
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "notes"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              Ghi chú nhanh
            </button>
          </nav>
        </div>

        {/* Footer Account Actions */}
        <div className="border-t border-white/5 pt-4 space-y-3">
          {/* Connection Indicators */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Offline</span>
                </>
              )}
            </div>
            
            {/* Sync state badge */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold uppercase ${
                syncStatus.status === "syncing" 
                  ? "text-indigo-400" 
                  : syncStatus.status === "error" 
                  ? "text-rose-400"
                  : "text-slate-500"
              }`}>
                {syncStatus.status === "syncing" ? "Syncing..." : "Synced"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-h-0">
        {/* Main Dashboard Header */}
        <header className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white capitalize">{activeTab}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Lập kế hoạch tối ưu cho ngày mới.</p>
          </div>

          {/* Sync Trigger button */}
          <button
            onClick={() => syncAll().catch(console.error)}
            disabled={syncStatus.status === "syncing" || !isOnline}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${syncStatus.status === "syncing" ? "animate-spin" : ""}`} />
            Đồng bộ ngay
          </button>
        </header>

        {/* Dynamic Tab Contents */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === "timeline" && <TimelineView />}
          {activeTab === "todos" && <TodoListView />}
          {activeTab === "notes" && <QuickNotesView />}
        </div>
      </main>
    </div>
  );
}

export default App;
