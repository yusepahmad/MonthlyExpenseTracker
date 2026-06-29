import { useEffect, useRef, useState } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
} from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function DatePicker({ value, onChange, max, placeholder = "Pilih tanggal", className = "" }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => (value ? parseISO(value) : new Date()));
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setViewMonth(value ? parseISO(value) : new Date());
  }, [open, value]);

  const maxDate = max ? parseISO(max) : null;
  const selectedDate = value ? parseISO(value) : null;

  const gridStart = startOfWeek(startOfMonth(viewMonth));
  const gridEnd = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function selectDay(day) {
    if (maxDate && isAfter(day, maxDate)) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-sm text-gray-900 dark:text-white hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300/60"
      >
        <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="truncate">
          {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: id }) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-72 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 dark:border-gray-700/70 shadow-card p-3 animate-scale-in origin-top">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(viewMonth, "MMMM yyyy", { locale: id })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[11px] font-light text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const disabled = maxDate ? isAfter(day, maxDate) : false;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const inCurrentMonth = isSameMonth(day, viewMonth);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium"
                      : disabled
                      ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                      : inCurrentMonth
                      ? "text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800/60"
                      : "text-gray-300 dark:text-gray-600 hover:bg-white/40 dark:hover:bg-gray-800/40"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
