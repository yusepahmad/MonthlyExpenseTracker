import { useEffect, useState } from "react";

const STORAGE_KEY = "expense-tracker-hide-amount";

export function useHideAmount() {
  const [hideAmount, setHideAmount] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(hideAmount));
  }, [hideAmount]);

  function toggleHideAmount() {
    setHideAmount((v) => !v);
  }

  return { hideAmount, toggleHideAmount };
}
