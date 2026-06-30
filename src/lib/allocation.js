import { excludeTransfers } from "./utils";

// 20/10/70 rule: 20% emergency fund, 10% investment, 70% living costs —
// applied to TOTAL income for the month (every income transaction, not
// just a "gaji pokok" category, so freelance/bonus/etc. count too).
export function calculateAllocation(transactions, activeMonth, settings) {
  const monthIncome = excludeTransfers(transactions)
    .filter((t) => t.type === "income" && t.date.startsWith(activeMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const emergencyTarget = monthIncome * (settings.emergencyPercent / 100);
  const investmentTarget = monthIncome * (settings.investmentPercent / 100);
  const livingTarget = monthIncome * (settings.livingPercent / 100);

  const taggedIncome = excludeTransfers(transactions).filter(
    (t) => t.type === "income" && t.date.startsWith(activeMonth) && t.allocationTag
  );

  const emergencyAllocated = taggedIncome
    .filter((t) => t.allocationTag === "emergency")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const investmentAllocated = taggedIncome
    .filter((t) => t.allocationTag === "investment")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Money left for daily living = total income minus whatever's already
  // tagged as emergency/investment. Untagged income defaults into this
  // "available for living" bucket rather than being silently lost.
  const netForLiving = monthIncome - emergencyAllocated - investmentAllocated;

  return {
    monthIncome,
    emergencyTarget,
    investmentTarget,
    livingTarget,
    emergencyAllocated,
    investmentAllocated,
    netForLiving,
    emergencyProgress: emergencyTarget > 0 ? Math.min(100, (emergencyAllocated / emergencyTarget) * 100) : 0,
    investmentProgress: investmentTarget > 0 ? Math.min(100, (investmentAllocated / investmentTarget) * 100) : 0,
  };
}

// Suggested internal split of the emergency fund pocket: 70% into a
// regular savings account (stable, fully liquid), 30% into a money-market
// fund (still very liquid, slightly better return) — from the user's
// reference strategy. Purely informational, not tracked as separate state.
export function emergencyFundSplit(emergencyAllocated) {
  return {
    savings: emergencyAllocated * 0.7,
    moneyMarket: emergencyAllocated * 0.3,
  };
}
