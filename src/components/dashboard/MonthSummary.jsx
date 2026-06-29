import { useMemo } from "react";
import { useApp } from "../../context/AppContext";
import AmountText from "../ui/AmountText";

export default function MonthSummary({ hideAmount }) {
  const { state } = useApp();

  const { totalIncome, totalExpense, net } = useMemo(() => {
    const monthTx = state.transactions.filter((t) => t.date.startsWith(state.activeMonth));
    const totalIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return { totalIncome, totalExpense, net: totalIncome - totalExpense };
  }, [state.transactions, state.activeMonth]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/90 via-purple-600/90 to-pink-500/90 backdrop-blur-2xl backdrop-saturate-150 text-white p-5 sm:p-6 shadow-glow border border-white/20 animate-fade-in">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-pink-300/20 blur-2xl" />

      <p className="relative text-sm font-light text-white/80">Saldo Bulan Ini</p>
      <p className="relative font-display text-3xl sm:text-4xl font-medium mt-1">
        <AmountText amount={net} hide={hideAmount} />
      </p>

      <div className="relative grid grid-cols-2 gap-3 mt-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/15">
          <p className="text-xs font-light text-white/70">Pemasukan</p>
          <p className="text-lg font-medium mt-0.5">
            <AmountText amount={totalIncome} hide={hideAmount} />
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/15">
          <p className="text-xs font-light text-white/70">Pengeluaran</p>
          <p className="text-lg font-medium mt-0.5">
            <AmountText amount={totalExpense} hide={hideAmount} />
          </p>
        </div>
      </div>
    </div>
  );
}
