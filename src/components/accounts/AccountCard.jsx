import { Wallet, Lock } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import RowMenu from "../ui/RowMenu";

export default function AccountCard({ account, onEdit, onDelete }) {
  const isNegative = account.balance < 0;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-500/20">
          <Wallet className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{account.name}</p>
          {account.isDefault && <p className="text-xs font-light text-gray-400">Default</p>}
        </div>
        {account.isDefault ? (
          <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" title="Akun default — tidak bisa dihapus" />
        ) : (
          <RowMenu onEdit={() => onEdit(account)} onDelete={() => onDelete(account)} />
        )}
      </div>

      <p className={`text-lg font-medium ${isNegative ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
        {formatCurrency(account.balance)}
      </p>
    </div>
  );
}
