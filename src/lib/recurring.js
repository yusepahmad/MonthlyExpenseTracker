export function dueRecurringTransactions(recurring, transactions, today = new Date()) {
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const currentDay = today.getDate();

  return recurring.filter((r) => {
    if (!r.is_active) return false;
    if (currentDay < r.day_of_month) return false;

    const alreadyLogged = transactions.some(
      (t) => t.recurring_id === r.id && t.date.startsWith(currentMonth)
    );
    return !alreadyLogged;
  });
}

export function buildTransactionFromRecurring(recurring, today = new Date()) {
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const day = String(recurring.day_of_month).padStart(2, "0");
  return {
    date: `${month}-${day}`,
    category: recurring.category,
    subcategory: "",
    amount: Number(recurring.amount),
    type: "expense",
    description: recurring.name,
    is_recurring: true,
    recurring_id: recurring.id,
  };
}

export function daysUntilNextBilling(recurring, today = new Date()) {
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (recurring.day_of_month >= currentDay) {
    return recurring.day_of_month - currentDay;
  }
  return daysInMonth - currentDay + recurring.day_of_month;
}
