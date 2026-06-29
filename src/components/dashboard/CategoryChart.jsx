import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useApp } from "../../context/AppContext";
import { getCategory } from "../../lib/categories";
import EmptyState from "../ui/EmptyState";
import AmountText from "../ui/AmountText";

const VIVID_PALETTE = ["#8B5CF6", "#EC4899", "#F59E0B", "#3B82F6", "#10B981", "#F43F5E", "#06B6D4", "#A855F7"];

export default function CategoryChart({ hideAmount, categoryFilter = "all" }) {
  const { state } = useApp();

  const data = useMemo(() => {
    const byCategory = {};
    state.transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(state.activeMonth))
      .filter((t) => categoryFilter === "all" || t.category === categoryFilter)
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(byCategory)
      .map(([category, value], i) => ({
        name: category,
        value,
        color: getCategory(category, state.customCategories)?.color || VIVID_PALETTE[i % VIVID_PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [state.transactions, state.activeMonth, state.customCategories, categoryFilter]);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Pengeluaran per Kategori
        </h3>
        <EmptyState
          message={categoryFilter === "all" ? "Belum ada pengeluaran." : "Tidak ada pengeluaran untuk kategori ini."}
          iconName="PieChart"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Pengeluaran per Kategori
      </h3>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((entry, i) => (
                <linearGradient key={entry.name} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.65} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 3 : 0}
              cornerRadius={8}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={`url(#grad-${i})`} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-light text-gray-400">Total Pengeluaran</span>
          <span className="font-display text-xl font-medium text-gray-900 dark:text-white mt-0.5">
            <AmountText amount={total} hide={hideAmount} />
          </span>
        </div>
      </div>

      <div className="space-y-2.5 mt-4">
        {data.slice(0, 6).map((d) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}aa)` }}
              />
              <span className="font-light text-gray-600 dark:text-gray-300">{d.name}</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">
              <AmountText amount={d.value} hide={hideAmount} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
