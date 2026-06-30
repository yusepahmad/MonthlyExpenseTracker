import { getAllCategories } from "./categories";
import { excludeTransfers, shiftMonth } from "./utils";

const LOOKBACK_MONTHS = 3;
const SUBSCRIPTION_REVIEW_THRESHOLD_MONTHS = 3;

function monthExpenseByCategory(transactions, month, customCategories) {
  const categories = getAllCategories(customCategories);
  const essentialByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.isEssential ?? true]));

  const totals = { essential: 0, nonEssential: 0, byCategory: {} };

  excludeTransfers(transactions)
    .filter((t) => t.type === "expense" && t.date.startsWith(month))
    .forEach((t) => {
      const amount = Number(t.amount);
      const isEssential = essentialByName.get(t.category.toLowerCase()) ?? true;
      if (isEssential) {
        totals.essential += amount;
      } else {
        totals.nonEssential += amount;
        totals.byCategory[t.category] = (totals.byCategory[t.category] || 0) + amount;
      }
    });

  return totals;
}

// Compares this month's non-essential spending against the average of the
// preceding LOOKBACK_MONTHS months, so the user sees concretely whether
// their "wants" spending is creeping up — not just an absolute number.
export function nonEssentialTrend(transactions, activeMonth, customCategories) {
  const current = monthExpenseByCategory(transactions, activeMonth, customCategories);

  const pastMonths = [];
  for (let i = 1; i <= LOOKBACK_MONTHS; i++) {
    pastMonths.push(shiftMonth(activeMonth, -i));
  }
  const pastTotals = pastMonths.map((m) => monthExpenseByCategory(transactions, m, customCategories).nonEssential);
  const monthsWithData = pastTotals.filter((v) => v > 0);
  const average = monthsWithData.length > 0 ? monthsWithData.reduce((s, v) => s + v, 0) / monthsWithData.length : 0;

  const topCategory = Object.entries(current.byCategory).sort(([, a], [, b]) => b - a)[0];

  return {
    currentNonEssential: current.nonEssential,
    currentEssential: current.essential,
    averageNonEssential: average,
    diff: current.nonEssential - average,
    hasEnoughData: monthsWithData.length > 0,
    topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
  };
}

// Sums how much every budgeted category went OVER its limit this month —
// i.e. money that was "supposed" to stay capped but didn't. Reuses the
// same per-category shape as useBudget but only needs spent/limit.
export function totalBudgetOverspend(budgetRows) {
  return budgetRows
    .filter((b) => b.isOverBudget)
    .reduce((sum, b) => sum + (b.spent - b.limit), 0);
}

// Recurring items running long enough to be worth a "still using this?"
// nudge. monthsActive is derived from how many distinct months actually
// have a logged transaction for this recurring_id — actual usage history,
// not just "time since created" (which isn't stored).
export function subscriptionsToReview(recurring, transactions) {
  return recurring
    .filter((r) => r.is_active)
    .map((r) => {
      const loggedTransactions = transactions.filter((t) => t.recurring_id === r.id);
      const monthsActive = new Set(loggedTransactions.map((t) => t.date.slice(0, 7))).size;
      const totalSpent = loggedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      return { ...r, monthsActive, totalSpent };
    })
    .filter((r) => r.monthsActive >= SUBSCRIPTION_REVIEW_THRESHOLD_MONTHS);
}
