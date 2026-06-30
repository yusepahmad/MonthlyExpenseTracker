import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";

const ASKED_KEY = "expense-tracker-reminder-asked";
const ENABLED_KEY = "expense-tracker-reminder-enabled";
const LAST_NOTIFIED_KEY = "expense-tracker-reminder-last-notified";
const REMINDER_HOUR = 20; // 20:00 local time

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function msUntilNextCheck() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(REMINDER_HOUR, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

// Best-effort daily reminder: only fires while this tab stays open (no
// service worker/PWA in this app, so there's no real background push).
// Asks opt-in once per browser, then — if enabled and Notification
// permission was granted — checks once a day at REMINDER_HOUR whether
// today already has a transaction, notifying if not.
export function useReminder() {
  const { state } = useApp();
  const [showPrompt, setShowPrompt] = useState(
    () => localStorage.getItem(ASKED_KEY) !== "true" && "Notification" in window
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const enabled = localStorage.getItem(ENABLED_KEY) === "true";
    if (!enabled || !("Notification" in window) || Notification.permission !== "granted") return;

    function checkAndNotify() {
      const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
      if (lastNotified === todayStr()) return;

      const hasTransactionToday = stateRef.current.transactions.some((t) => t.date === todayStr());
      if (!hasTransactionToday) {
        new Notification("Belum catat pengeluaran hari ini?", {
          body: "Jangan lupa catat transaksi hari ini di Expense Tracker.",
          icon: "/favicon.svg",
        });
      }
      localStorage.setItem(LAST_NOTIFIED_KEY, todayStr());
    }

    const timeoutId = setTimeout(function run() {
      checkAndNotify();
      // After the first fire, repeat every 24h while the tab stays open.
      setInterval(checkAndNotify, 24 * 60 * 60 * 1000);
    }, msUntilNextCheck());

    return () => clearTimeout(timeoutId);
  }, []);

  function enableReminder() {
    localStorage.setItem(ASKED_KEY, "true");
    setShowPrompt(false);

    if (!("Notification" in window)) return;
    Notification.requestPermission().then((permission) => {
      localStorage.setItem(ENABLED_KEY, String(permission === "granted"));
    });
  }

  function dismissPrompt() {
    localStorage.setItem(ASKED_KEY, "true");
    localStorage.setItem(ENABLED_KEY, "false");
    setShowPrompt(false);
  }

  return { showPrompt, enableReminder, dismissPrompt };
}
