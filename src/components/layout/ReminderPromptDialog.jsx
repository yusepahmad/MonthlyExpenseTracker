import { Bell } from "lucide-react";

export default function ReminderPromptDialog({ open, onEnable, onDismiss }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 dark:border-gray-700/70 p-5 shadow-card animate-scale-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/20 mb-3">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="font-display text-base font-medium text-gray-900 dark:text-white mb-1.5">
          Aktifkan pengingat harian?
        </h3>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-3">
          Dapatkan pengingat jam 20:00 kalau hari itu belum ada transaksi yang dicatat.
        </p>
        <p className="text-xs font-light text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-900/20 rounded-xl px-3 py-2 mb-4">
          Catatan: pengingat ini hanya aktif selagi tab browser ini terbuka, bukan notifikasi push yang muncul walau aplikasi ditutup.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl border border-white/60 dark:border-gray-600/60 bg-white/30 dark:bg-transparent backdrop-blur-sm text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            Tidak, makasih
          </button>
          <button
            onClick={onEnable}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
          >
            Aktifkan
          </button>
        </div>
      </div>
    </div>
  );
}
