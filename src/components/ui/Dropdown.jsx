import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Dropdown({ value, options, onChange, placeholder = "Pilih...", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-sm text-gray-900 dark:text-white hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300/60"
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon}
          {selected?.label || <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 dark:border-gray-700/70 shadow-card p-1.5 animate-scale-in origin-top">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                opt.value === value
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium"
                  : "text-gray-700 dark:text-gray-200 font-light hover:bg-white/60 dark:hover:bg-gray-800/60"
              }`}
            >
              {opt.icon}
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
