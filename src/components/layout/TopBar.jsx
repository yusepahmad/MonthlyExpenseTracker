import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MoreVertical, FileDown, Upload, Download, Eye, EyeOff, LogOut } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useExcel } from "../../hooks/useExcel";
import { shiftMonth } from "../../lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({ theme, onToggleTheme, hideAmount, onToggleHideAmount, user, onSignOut }) {
  const { state, dispatch } = useApp();
  const { importFile, exportFile, downloadTemplate } = useExcel();
  const fileInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importFile(file).catch((err) => {
      alert(`Gagal import file: ${err.message}`);
    });
    e.target.value = "";
    setMenuOpen(false);
  }

  function goToMonth(delta) {
    dispatch({ type: "SET_ACTIVE_MONTH", payload: shiftMonth(state.activeMonth, delta) });
  }

  return (
    <header className="flex items-center justify-between gap-3 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/60 dark:border-gray-800/60 px-4 sm:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 rounded-xl px-2 py-1.5">
        <button
          onClick={() => goToMonth(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-medium text-sm text-gray-900 dark:text-white min-w-[72px] text-center">
          {state.activeMonth}
        </span>
        <button
          onClick={() => goToMonth(1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:scale-110 transition-transform"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Desktop actions */}
      <div className="hidden sm:flex items-center gap-2">
        {state.fileName && (
          <span className="text-xs font-light text-gray-400 truncate max-w-[140px]">
            {state.fileName}
          </span>
        )}
        <button
          onClick={onToggleHideAmount}
          title={hideAmount ? "Tampilkan nominal" : "Sembunyikan nominal"}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300 hover:scale-110 transition-transform"
        >
          {hideAmount ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-light rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:scale-[1.03] transition-all"
        >
          <FileDown className="w-4 h-4" />
          Contoh Template
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-light rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:scale-[1.03] transition-all"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button
          onClick={exportFile}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.03] transition-all shadow-glow"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={onSignOut}
          title={user?.email}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300 hover:text-red-500 hover:scale-110 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Mobile actions */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={onToggleHideAmount}
          title={hideAmount ? "Tampilkan nominal" : "Sembunyikan nominal"}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300"
        >
          {hideAmount ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300"
          >
            <MoreVertical className="w-[18px] h-[18px]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl shadow-card border border-white/60 dark:border-gray-800/60 py-1.5 z-20 animate-scale-in origin-top-right">
                <button
                  onClick={() => { downloadTemplate(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <FileDown className="w-4 h-4" />
                  Contoh Template
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={() => { exportFile(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="border-t border-white/60 dark:border-gray-700/60 my-1" />
                <button
                  onClick={() => { onSignOut(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-light text-red-500 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
