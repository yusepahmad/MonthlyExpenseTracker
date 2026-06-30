import { Trophy, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { evaluateChallenge } from "../../lib/challenges";
import { getCategory } from "../../lib/categories";
import { formatCurrency, formatDate } from "../../lib/utils";
import Icon from "../ui/Icon";
import RowMenu from "../ui/RowMenu";

const STATUS_META = {
  active: { label: "Berjalan", color: "text-indigo-600", barClass: "bg-gradient-to-r from-indigo-500 to-purple-500", Icon: Clock },
  completed: { label: "Berhasil!", color: "text-green-600", barClass: "bg-gradient-to-r from-green-500 to-emerald-400", Icon: CheckCircle2 },
  failed: { label: "Gagal", color: "text-red-500", barClass: "bg-gradient-to-r from-red-500 to-rose-400", Icon: XCircle },
  upcoming: { label: "Akan datang", color: "text-gray-400", barClass: "bg-gradient-to-r from-gray-400 to-gray-300", Icon: Clock },
};

const TYPE_LABEL = {
  no_spend: "No-Spend",
  spending_limit: "Batas Hemat",
};

export default function ChallengeCard({ challenge, onEdit, onDelete }) {
  const { state } = useApp();
  const category = getCategory(challenge.category, state.customCategories);
  const evaluation = evaluateChallenge(challenge, state.transactions);
  const meta = STATUS_META[evaluation.status];
  const StatusIcon = meta.Icon;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category?.color}22` }}
        >
          {evaluation.status === "completed" ? (
            <Trophy className="w-5 h-5 text-amber-500" />
          ) : (
            <Icon name={category?.icon} className="w-5 h-5" style={{ color: category?.color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {TYPE_LABEL[challenge.type]} — {challenge.category}
          </p>
          <p className="text-xs font-light text-gray-400">
            {formatDate(challenge.startDate)} – {formatDate(challenge.endDate)}
          </p>
        </div>
        <RowMenu onEdit={() => onEdit(challenge)} onDelete={() => onDelete(challenge)} />
      </div>

      {challenge.type === "spending_limit" && (
        <p className="text-xs font-light text-gray-500 dark:text-gray-400 mb-1.5">
          {formatCurrency(evaluation.spent)} / {formatCurrency(challenge.targetAmount)}
        </p>
      )}

      <div className="h-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${meta.barClass}`}
          style={{ width: `${evaluation.percentage}%` }}
        />
      </div>

      <p className={`flex items-center gap-1.5 text-xs font-medium ${meta.color}`}>
        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
        {meta.label}
        <span className="font-light text-gray-400">· {evaluation.progressLabel}</span>
      </p>
    </div>
  );
}
