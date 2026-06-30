import { excludeTransfers } from "./utils";

function monthIncomeOf(transactions, month) {
  return excludeTransfers(transactions)
    .filter((t) => t.type === "income" && t.date.startsWith(month))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function allMonthsWithIncome(transactions, beforeMonth) {
  const months = new Set(
    excludeTransfers(transactions)
      .filter((t) => t.type === "income" && t.date.slice(0, 7) < beforeMonth)
      .map((t) => t.date.slice(0, 7))
  );
  return Array.from(months).sort();
}

// 20/10/70 rule applied automatically to every month's TOTAL income (every
// income transaction, not just "gaji pokok" — freelance/bonus/etc. count
// too). No manual tagging: each month's income is allocated 20/10/70 the
// moment it's recorded.
//
// Carry-over works like a debt to yourself: if a past month's actual
// allocation (= that month's income x percent) fell short of that month's
// target, the shortfall is added on top of the current month's target —
// exactly like Debt Tracking's remainingAmount, except recomputed live
// from transaction history instead of stored separately.
export function calculateAllocation(transactions, activeMonth, settings) {
  const monthIncome = monthIncomeOf(transactions, activeMonth);

  const emergencyAllocated = monthIncome * (settings.emergencyPercent / 100);
  const investmentAllocated = monthIncome * (settings.investmentPercent / 100);
  const livingTarget = monthIncome * (settings.livingPercent / 100);

  let emergencyCarryOver = 0;
  let investmentCarryOver = 0;

  for (const month of allMonthsWithIncome(transactions, activeMonth)) {
    const income = monthIncomeOf(transactions, month);
    const monthEmergencyTarget = income * (settings.emergencyPercent / 100) + emergencyCarryOver;
    const monthInvestmentTarget = income * (settings.investmentPercent / 100) + investmentCarryOver;
    const monthEmergencyActual = income * (settings.emergencyPercent / 100);
    const monthInvestmentActual = income * (settings.investmentPercent / 100);

    // Each month allocates exactly its own percentage automatically, so a
    // shortfall only happens when this month's target (incl. carry-over)
    // exceeds what this month alone could allocate — i.e. old debt that
    // hasn't been paid down by a high-income month yet.
    emergencyCarryOver = Math.max(0, monthEmergencyTarget - monthEmergencyActual);
    investmentCarryOver = Math.max(0, monthInvestmentTarget - monthInvestmentActual);
  }

  const emergencyTarget = monthIncome * (settings.emergencyPercent / 100) + emergencyCarryOver;
  const investmentTarget = monthIncome * (settings.investmentPercent / 100) + investmentCarryOver;

  // Money left for daily living = total income minus this month's
  // auto-allocated emergency/investment pockets (carry-over debt doesn't
  // reduce living money further — it's a target/reminder, not money
  // actually withheld from this month).
  const netForLiving = monthIncome - emergencyAllocated - investmentAllocated;

  return {
    monthIncome,
    emergencyTarget,
    investmentTarget,
    livingTarget,
    emergencyAllocated,
    investmentAllocated,
    emergencyCarryOver,
    investmentCarryOver,
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

// Cumulative amount auto-allocated to investment since the earliest
// income transaction up to (and including) activeMonth — this is the
// "cost basis" the user is presumed to have actually put into investments
// over time, used to compute gain/loss against their self-reported
// current portfolio value.
export function cumulativeInvested(transactions, activeMonth, investmentPercent) {
  const months = new Set(
    excludeTransfers(transactions)
      .filter((t) => t.type === "income" && t.date.slice(0, 7) <= activeMonth)
      .map((t) => t.date.slice(0, 7))
  );
  return Array.from(months).reduce(
    (sum, month) => sum + monthIncomeOf(transactions, month) * (investmentPercent / 100),
    0
  );
}

// Investment gain/loss: difference between the portfolio's current
// self-reported value (user updates this manually, like Savings Goal /
// Debt remainingAmount) and the cumulative cost basis above.
export function calculateInvestmentReturn(transactions, activeMonth, investmentPercent, currentValue) {
  const invested = cumulativeInvested(transactions, activeMonth, investmentPercent);
  const gain = currentValue - invested;
  const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;
  return { invested, currentValue, gain, gainPercent };
}
