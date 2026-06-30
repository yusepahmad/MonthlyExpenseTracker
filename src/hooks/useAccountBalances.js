import { useMemo } from "react";
import { useApp } from "../context/AppContext";

// Per-account balance is all-time income minus expense for transactions
// tagged to that account. Transfers are two ordinary transactions (one
// expense leg, one income leg in different accounts), so they fall out of
// this sum naturally without any special-casing.
export function useAccountBalances() {
  const { state } = useApp();

  return useMemo(() => {
    const balances = {};
    for (const account of state.accounts) {
      balances[account.id] = 0;
    }

    for (const t of state.transactions) {
      const accountId = t.account || "acc_cash";
      const delta = t.type === "income" ? Number(t.amount) : -Number(t.amount);
      balances[accountId] = (balances[accountId] || 0) + delta;
    }

    return state.accounts.map((account) => ({
      ...account,
      balance: balances[account.id] || 0,
    }));
  }, [state.accounts, state.transactions]);
}
