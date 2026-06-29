import { PieChart as PieIcon, BarChart3, LineChart as LineIcon } from "lucide-react";

const TYPES = [
  { value: "pie", label: "Pie", icon: PieIcon },
  { value: "bar", label: "Bar", icon: BarChart3 },
  { value: "line", label: "Line", icon: LineIcon },
];

export default function ChartTypeToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-700/60 p-1">
      {TYPES.map((t) => {
        const TypeIcon = t.icon;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              value === t.value
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <TypeIcon className="w-4 h-4" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
