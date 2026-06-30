import { excludeTransfers } from "./utils";
import { getAllCategories } from "./categories";

function monthIncomeOf(transactions, month) {
  return excludeTransfers(transactions)
    .filter((t) => t.type === "income" && t.date.startsWith(month))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

// Sums this month's expenses split by which 20/10/70 pocket each category
// belongs to. "investment" categories (e.g. Pendidikan/kuliah, tagged via
// CategoryForm) count as money already going toward the Investasi target
// instead of eating into "Dana Bersih untuk Hidup" — the user is investing
// in themselves, not spending it away.
function monthExpenseByPocket(transactions, month, customCategories) {
  const categories = getAllCategories(customCategories);
  const pocketByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.allocationPocket || "living"]));

  let living = 0;
  let investment = 0;

  excludeTransfers(transactions)
    .filter((t) => t.type === "expense" && t.date.startsWith(month))
    .forEach((t) => {
      const pocket = pocketByName.get(t.category.toLowerCase()) || "living";
      if (pocket === "investment") {
        investment += Number(t.amount);
      } else {
        living += Number(t.amount);
      }
    });

  return { living, investment };
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
export function calculateAllocation(transactions, activeMonth, settings, customCategories = []) {
  const monthIncome = monthIncomeOf(transactions, activeMonth);

  const emergencyAllocated = monthIncome * (settings.emergencyPercent / 100);
  const investmentAutoAllocated = monthIncome * (settings.investmentPercent / 100);
  const livingTarget = monthIncome * (settings.livingPercent / 100);

  // Spending in "investment" pocket categories (e.g. Pendidikan/kuliah)
  // counts toward this month's investment contribution alongside the
  // automatic 10% — investing in yourself still pays down the target.
  const { living: livingSpent, investment: investmentSpent } = monthExpenseByPocket(
    transactions,
    activeMonth,
    customCategories
  );
  const investmentAllocated = investmentAutoAllocated + investmentSpent;

  let emergencyCarryOver = 0;
  let investmentCarryOver = 0;

  for (const month of allMonthsWithIncome(transactions, activeMonth)) {
    const income = monthIncomeOf(transactions, month);
    const { investment: monthInvestmentSpent } = monthExpenseByPocket(transactions, month, customCategories);
    const monthEmergencyTarget = income * (settings.emergencyPercent / 100) + emergencyCarryOver;
    const monthInvestmentTarget = income * (settings.investmentPercent / 100) + investmentCarryOver;
    const monthEmergencyActual = income * (settings.emergencyPercent / 100);
    const monthInvestmentActual = income * (settings.investmentPercent / 100) + monthInvestmentSpent;

    // Each month allocates exactly its own percentage automatically (plus
    // any investment-pocket spending), so a shortfall only happens when
    // this month's target (incl. carry-over) exceeds what this month alone
    // could allocate — i.e. old debt that hasn't been paid down yet.
    emergencyCarryOver = Math.max(0, monthEmergencyTarget - monthEmergencyActual);
    investmentCarryOver = Math.max(0, monthInvestmentTarget - monthInvestmentActual);
  }

  const emergencyTarget = monthIncome * (settings.emergencyPercent / 100) + emergencyCarryOver;
  const investmentTarget = monthIncome * (settings.investmentPercent / 100) + investmentCarryOver;

  // Budgeted money for daily living = total income minus this month's
  // auto-allocated emergency/investment pockets (carry-over debt doesn't
  // reduce this further — it's a target/reminder, not money actually
  // withheld from this month).
  const netForLiving = monthIncome - emergencyAllocated - investmentAutoAllocated;

  // The number the user actually wants to see day to day: budgeted living
  // money minus what's ALREADY been spent on living-pocket categories this
  // month. Goes negative the moment living spending outpaces the budget —
  // surfaced as a clear "minus" in the UI rather than hidden inside a
  // still-positive-looking allocation target.
  const realRemainingForLiving = netForLiving - livingSpent;

  return {
    monthIncome,
    emergencyTarget,
    investmentTarget,
    livingTarget,
    emergencyAllocated,
    investmentAllocated,
    investmentAutoAllocated,
    investmentSpent,
    livingSpent,
    emergencyCarryOver,
    investmentCarryOver,
    netForLiving,
    realRemainingForLiving,
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
