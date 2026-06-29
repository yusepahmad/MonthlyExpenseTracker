import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import TransactionRow from "./TransactionRow";
import TransactionFilter from "./TransactionFilter";
import EmptyState from "../ui/EmptyState";

const DEFAULT_FILTERS = {
  type: "all",
  category: "all",
  search: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
};

export default function TransactionList({ onEdit, hideAmount }) {
  const { state } = useApp();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    const hasDateRange = filters.dateFrom || filters.dateTo;

    return state.transactions
      .filter((t) => (hasDateRange ? true : t.date.startsWith(state.activeMonth)))
      .filter((t) => !filters.dateFrom || t.date >= filters.dateFrom)
      .filter((t) => !filters.dateTo || t.date <= filters.dateTo)
      .filter((t) => filters.type === "all" || t.type === filters.type)
      .filter((t) => filters.category === "all" || t.category === filters.category)
      .filter((t) =>
        !filters.search ||
        (t.description || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(filters.search.toLowerCase())
      )
      .filter((t) => !filters.amountMin || Number(t.amount) >= Number(filters.amountMin))
      .filter((t) => !filters.amountMax || Number(t.amount) <= Number(filters.amountMax))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, state.activeMonth, filters]);

  return (
    <div>
      <TransactionFilter filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 shadow-soft animate-fade-in">
          <EmptyState message="Tidak ada transaksi yang cocok dengan filter." />
        </div>
      ) : (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 shadow-soft divide-y divide-white/40 dark:divide-gray-800/60 animate-fade-in">
          {filtered.map((t) => (
            <TransactionRow key={t.id} transaction={t} onEdit={onEdit} hideAmount={hideAmount} />
          ))}
        </div>
      )}
    </div>
  );
}
