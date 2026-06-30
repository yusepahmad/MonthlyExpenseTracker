import { excludeTransfers } from "./utils";

const todayStr = () => new Date().toISOString().slice(0, 10);

// Registry of challenge evaluators, keyed by type — adding a new challenge
// type later only means adding an entry here, not touching every caller.
const EVALUATORS = {
  // "No-spend kategori X selama N hari": fails as soon as ANY expense in
  // that category lands within the challenge window.
  no_spend(challenge, transactions) {
    const offendingTransactions = transactions.filter(
      (t) =>
        t.type === "expense" &&
        t.category === challenge.category &&
        t.date >= challenge.startDate &&
        t.date <= challenge.endDate
    );
    return {
      spent: offendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
      isBroken: offendingTransactions.length > 0,
      progressLabel: offendingTransactions.length === 0 ? "Belum ada pengeluaran" : `${offendingTransactions.length}x pengeluaran tercatat`,
    };
  },

  // "Hemat kategori Y di bawah Rp X" within the window: fails once total
  // spend in that category exceeds the target amount.
  spending_limit(challenge, transactions) {
    const inWindow = transactions.filter(
      (t) =>
        t.type === "expense" &&
        t.category === challenge.category &&
        t.date >= challenge.startDate &&
        t.date <= challenge.endDate
    );
    const spent = inWindow.reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      spent,
      isBroken: spent > Number(challenge.targetAmount),
      progressLabel: `${inWindow.length}x pengeluaran tercatat`,
    };
  },
};

export const CHALLENGE_TYPES = [
  { value: "no_spend", label: "No-Spend (tanpa pengeluaran kategori tertentu)" },
  { value: "spending_limit", label: "Batas Hemat (pengeluaran di bawah target)" },
];

export function evaluateChallenge(challenge, transactions) {
  const evaluator = EVALUATORS[challenge.type];
  const realTransactions = excludeTransfers(transactions);
  const result = evaluator(challenge, realTransactions);

  const today = todayStr();
  const hasEnded = today > challenge.endDate;
  const hasStarted = today >= challenge.startDate;

  let status;
  if (result.isBroken) {
    status = "failed";
  } else if (hasEnded) {
    status = "completed";
  } else if (hasStarted) {
    status = "active";
  } else {
    status = "upcoming";
  }

  const totalDays = Math.max(1, daysBetween(challenge.startDate, challenge.endDate) + 1);
  const elapsedDays = Math.min(totalDays, Math.max(0, daysBetween(challenge.startDate, today < challenge.endDate ? today : challenge.endDate) + 1));
  const percentage = status === "upcoming" ? 0 : Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return { ...result, status, percentage, totalDays, elapsedDays };
}

function daysBetween(fromStr, toStr) {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}
