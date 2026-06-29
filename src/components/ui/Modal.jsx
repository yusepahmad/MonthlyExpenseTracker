import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:px-4 animate-fade-in"
    >
      <div className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-2xl sm:rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 dark:border-gray-700/70 p-5 shadow-card animate-slide-up sm:animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-medium text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 dark:bg-gray-800/60 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:scale-110 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
