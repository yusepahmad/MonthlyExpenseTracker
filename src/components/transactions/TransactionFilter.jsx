import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getAllCategories } from "../../lib/categories";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";
import Icon from "../ui/Icon";

const TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "expense", label: "Pengeluaran" },
  { value: "income", label: "Pemasukan" },
];

function isFilterActive(filters) {
  return Boolean(
    filters.search || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax
  );
}

export default function TransactionFilter({ filters, onChange, onReset }) {
  const { state } = useApp();
  const categories = getAllCategories(state.customCategories);
  const [showMore, setShowMore] = useState(false);

  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...categories.map((c) => ({
      value: c.name,
      label: c.name,
      icon: <Icon name={c.icon} className="w-4 h-4" style={{ color: c.color }} />,
    })),
  ];

  const active = isFilterActive(filters);

  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Cari deskripsi atau kategori..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>

        <Dropdown
          value={filters.type}
          onChange={(value) => onChange({ ...filters, type: value })}
          options={TYPE_OPTIONS}
          className="w-36"
        />
        <Dropdown
          value={filters.category}
          onChange={(value) => onChange({ ...filters, category: value })}
          options={categoryOptions}
          className="w-40"
        />

        <button
          onClick={() => setShowMore((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-light transition-colors ${
            active
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              : "border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm text-gray-600 dark:text-gray-300"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter Lanjutan
        </button>

        {active && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-light text-red-500 hover:bg-white/40 dark:hover:bg-gray-800/40"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {showMore && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 dark:border-gray-700/50 animate-fade-in">
          <div>
            <label className="block text-xs font-light text-gray-500 dark:text-gray-400 mb-1">
              Dari Tanggal
            </label>
            <DatePicker
              value={filters.dateFrom}
              onChange={(value) => onChange({ ...filters, dateFrom: value })}
              placeholder="Pilih tanggal"
            />
          </div>
          <div>
            <label className="block text-xs font-light text-gray-500 dark:text-gray-400 mb-1">
              Sampai Tanggal
            </label>
            <DatePicker
              value={filters.dateTo}
              onChange={(value) => onChange({ ...filters, dateTo: value })}
              placeholder="Pilih tanggal"
            />
          </div>
          <div>
            <label className="block text-xs font-light text-gray-500 dark:text-gray-400 mb-1">
              Nominal Min
            </label>
            <input
              type="number"
              min="0"
              value={filters.amountMin}
              onChange={(e) => onChange({ ...filters, amountMin: e.target.value })}
              placeholder="0"
              className="w-full px-2.5 py-2 rounded-lg border border-white/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-2xl backdrop-saturate-150 text-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            />
          </div>
          <div>
            <label className="block text-xs font-light text-gray-500 dark:text-gray-400 mb-1">
              Nominal Max
            </label>
            <input
              type="number"
              min="0"
              value={filters.amountMax}
              onChange={(e) => onChange({ ...filters, amountMax: e.target.value })}
              placeholder="Tanpa batas"
              className="w-full px-2.5 py-2 rounded-lg border border-white/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-2xl backdrop-saturate-150 text-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            />
          </div>
        </div>
      )}
    </div>
  );
}
