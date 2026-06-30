import { Gift, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { evaluatePurchase } from "../../lib/wishlist";
import RowMenu from "../ui/RowMenu";

const PRIORITY_LABEL = { low: "Rendah", medium: "Sedang", high: "Tinggi" };
const PRIORITY_COLOR = {
  low: "text-gray-400 bg-gray-400/10",
  medium: "text-amber-500 bg-amber-500/10",
  high: "text-red-500 bg-red-500/10",
};

export default function WishlistItemCard({ item, balance, netBurnPerDay, hasEnoughData, onEdit, onDelete }) {
  const evaluation = evaluatePurchase(item, balance, netBurnPerDay);
  const canEvaluate = hasEnoughData;
  const isTunda = canEvaluate && evaluation.recommendation === "tunda";

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-500/20">
          <Gift className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
          <p className="text-xs font-light text-gray-400">{formatCurrency(item.price)}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${PRIORITY_COLOR[item.priority]}`}>
          {PRIORITY_LABEL[item.priority]}
        </span>
        <RowMenu onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
      </div>

      {canEvaluate ? (
        <div
          className={`flex items-start gap-2 text-xs font-light rounded-xl px-3 py-2.5 ${
            isTunda
              ? "bg-amber-50/70 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
              : "bg-green-50/70 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          }`}
        >
          {isTunda ? (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          )}
          <span>
            {isTunda
              ? `Sebaiknya tunda dulu — sisa saldo setelah beli (${formatCurrency(evaluation.remainingAfterPurchase)}) cukup tipis dibanding kebutuhan arus kas kamu.`
              : `Aman dibeli sekarang — sisa saldo setelah beli ${formatCurrency(evaluation.remainingAfterPurchase)}.`}
          </span>
        </div>
      ) : (
        <p className="text-xs font-light text-gray-400">
          Belum cukup data transaksi untuk memberi saran beli/tunda.
        </p>
      )}
    </div>
  );
}
