import { LayoutDashboard, ArrowLeftRight, Target, Repeat, BarChart3, PiggyBank } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "transactions", label: "Transaksi", icon: ArrowLeftRight },
  { key: "budget", label: "Budget", icon: Target },
  { key: "recurring", label: "Recurring", icon: Repeat },
  { key: "reports", label: "Laporan", icon: BarChart3 },
  { key: "savings", label: "Tabungan", icon: PiggyBank },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/60 dark:border-gray-800/60 flex items-center gap-1 overflow-x-auto px-2 py-2 pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => {
        const ItemIcon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-200 shrink-0 ${
              activePage === item.key
                ? "text-purple-600 dark:text-purple-400 scale-110"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <ItemIcon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
