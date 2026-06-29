import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useApp } from "../../context/AppContext";
import { getCategory } from "../../lib/categories";
import { formatCurrency } from "../../lib/utils";
import EmptyState from "../ui/EmptyState";

const VIVID_PALETTE = ["#8B5CF6", "#EC4899", "#F59E0B", "#3B82F6", "#10B981", "#F43F5E", "#06B6D4", "#A855F7"];

export default function PieChartView({ categoryTotals }) {
  const { state } = useApp();

  if (categoryTotals.length === 0) {
    return <EmptyState message="Tidak ada pengeluaran di periode ini." iconName="PieChart" />;
  }

  const data = categoryTotals.map((c, i) => ({
    ...c,
    color: getCategory(c.category, state.customCategories)?.color || VIVID_PALETTE[i % VIVID_PALETTE.length],
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
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
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-light text-gray-400">Total Pengeluaran</span>
          <span className="font-display text-xl font-medium text-gray-900 dark:text-white mt-0.5">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 mt-4">
        {data.slice(0, 6).map((d) => (
          <div key={d.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
              <span className="font-light text-gray-600 dark:text-gray-300">{d.category}</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
