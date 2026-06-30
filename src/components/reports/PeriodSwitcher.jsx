const PERIODS = [
  { value: "week", label: "Mingguan" },
  { value: "month", label: "Bulanan" },
  { value: "year", label: "Tahunan" },
  { value: "custom", label: "Custom" },
];

export default function PeriodSwitcher({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-700/60 p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === p.value
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
