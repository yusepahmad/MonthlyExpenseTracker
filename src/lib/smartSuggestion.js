const LOOKBACK_DAYS = 30;

export function findSimilarRecentTransaction(amountInput, transactions, today = new Date()) {
  const digits = String(amountInput || "").replace(/\D/g, "");
  if (!digits || digits.length < 3) return null;

  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const candidates = transactions.filter(
    (t) => t.type === "expense" && t.date >= cutoffStr && String(t.amount).startsWith(digits)
  );

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => b.date.localeCompare(a.date))[0];
}
