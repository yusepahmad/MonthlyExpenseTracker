import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { dueRecurringTransactions } from "../lib/recurring";

const LAST_CHECKED_KEY = "expense-tracker-recurring-last-checked";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useRecurringCheck() {
  const { state } = useApp();
  const [dueItems, setDueItems] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const lastChecked = localStorage.getItem(LAST_CHECKED_KEY);
    if (lastChecked === todayStr()) return;

    const due = dueRecurringTransactions(state.recurring, state.transactions);
    if (due.length > 0) {
      setDueItems(due);
    } else {
      localStorage.setItem(LAST_CHECKED_KEY, todayStr());
    }
    // Only run once on mount — re-checking continuously isn't needed since
    // due-ness only changes when the day or the underlying data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markChecked() {
    localStorage.setItem(LAST_CHECKED_KEY, todayStr());
    setDueItems([]);
    setDismissed(true);
  }

  return { dueItems: dismissed ? [] : dueItems, markChecked };
}
