import { useState } from "react";
import { useApp } from "../context/AppContext";
import { getAllCategories } from "../lib/categories";
import MonthSummary from "../components/dashboard/MonthSummary";
import CategoryChart from "../components/dashboard/CategoryChart";
import BudgetProgress from "../components/dashboard/BudgetProgress";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import InsightCards from "../components/dashboard/InsightCards";
import InsightMessages from "../components/dashboard/InsightMessages";
import CashFlowPredictionCard from "../components/dashboard/CashFlowPredictionCard";
import HealthScoreCard from "../components/dashboard/HealthScoreCard";
import Dropdown from "../components/ui/Dropdown";
import Icon from "../components/ui/Icon";

export default function DashboardPage({ hideAmount }) {
  const { state } = useApp();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...getAllCategories(state.customCategories).map((c) => ({
      value: c.name,
      label: c.name,
      icon: <Icon name={c.icon} className="w-4 h-4" style={{ color: c.color }} />,
    })),
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <MonthSummary hideAmount={hideAmount} />

      <InsightCards hideAmount={hideAmount} />

      <InsightMessages />

      <CashFlowPredictionCard hideAmount={hideAmount} />

      <HealthScoreCard />

      <div className="flex justify-end">
        <Dropdown
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryChart hideAmount={hideAmount} categoryFilter={categoryFilter} />
        <BudgetProgress hideAmount={hideAmount} />
      </div>

      <RecentTransactions hideAmount={hideAmount} categoryFilter={categoryFilter} />
    </div>
  );
}
