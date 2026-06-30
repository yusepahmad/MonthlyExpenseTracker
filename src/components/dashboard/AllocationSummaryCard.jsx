import { ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { useFinancialAllocation } from "../../hooks/useFinancialAllocation";
import { formatCurrency } from "../../lib/utils";
import AmountText from "../ui/AmountText";

export default function AllocationSummaryCard({ hideAmount }) {
  const allocation = useFinancialAllocation();

  if (allocation.monthIncome <= 0) return null;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Alokasi Keuangan Bulan Ini</h3>
      </div>

      <p className="text-xs font-light text-gray-400 mb-1">Dana Bersih untuk Hidup</p>
      <p className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
        <AmountText amount={allocation.netForLiving} hide={hideAmount} />
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-amber-50/70 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs font-light text-amber-700 dark:text-amber-400">Dana Darurat</p>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            <AmountText amount={allocation.emergencyAllocated} hide={hideAmount} />
          </p>
          <p className="text-xs font-light text-gray-400">
            target {hideAmount ? "••••" : formatCurrency(allocation.emergencyTarget)}
          </p>
        </div>
        <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <p className="text-xs font-light text-indigo-700 dark:text-indigo-400">Investasi</p>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            <AmountText amount={allocation.investmentAllocated} hide={hideAmount} />
          </p>
          <p className="text-xs font-light text-gray-400">
            target {hideAmount ? "••••" : formatCurrency(allocation.investmentTarget)}
          </p>
        </div>
      </div>
    </div>
  );
}
