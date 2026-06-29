export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 dark:border-gray-700/70 p-5 shadow-card animate-scale-in">
        <h3 className="font-display text-base font-medium text-gray-900 dark:text-white mb-1.5">
          {title}
        </h3>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/60 dark:border-gray-600/60 bg-white/30 dark:bg-transparent backdrop-blur-sm text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow-pink"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
