import { LayoutDashboard, ArrowLeftRight, Target, Repeat, ChevronLeft, Wallet, BarChart3, PiggyBank, Gift } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "transactions", label: "Transaksi", icon: ArrowLeftRight },
  { key: "budget", label: "Budget", icon: Target },
  { key: "recurring", label: "Recurring", icon: Repeat },
  { key: "reports", label: "Laporan", icon: BarChart3 },
  { key: "savings", label: "Tabungan", icon: PiggyBank },
  { key: "wishlist", label: "Wishlist", icon: Gift },
  { key: "accounts", label: "Akun", icon: Wallet },
];

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <aside
      className={`hidden md:flex shrink-0 flex-col bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/60 dark:border-gray-800/60 p-3 transition-all duration-300 ease-out ${
        collapsed ? "md:w-16" : "md:w-56"
      }`}
    >
      <div className={`flex items-center gap-2 mb-8 px-1 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-glow shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        {!collapsed && (
          <h1 className="font-display text-base font-medium text-gray-900 dark:text-white whitespace-nowrap animate-fade-in">
            Expense Tracker
          </h1>
        )}
      </div>

      <nav className="space-y-1.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center px-0" : ""
              } ${
                activePage === item.key
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow"
                  : "text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <ItemIcon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`pt-3 mt-2 border-t border-white/60 dark:border-gray-800/60 flex ${collapsed ? "justify-center" : "justify-end"}`}>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Perluas sidebar" : "Tutup sidebar"}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
    </aside>
  );
}
