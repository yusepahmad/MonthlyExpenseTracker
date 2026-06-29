const STORAGE_KEY = "expense-tracker-state";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable or full — silently skip, Excel export remains the backup
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
