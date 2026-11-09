// Guest preferences live in this browser only (PRD #1). Every storage call is wrapped:
// private windows and blocked storage must not break the page.
import { PREFS_KEY } from "./config.js";

function readFrom(store) {
  try {
    const raw = store.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadPrefs() {
  // localStorage first, then sessionStorage (used when localStorage is blocked).
  return readFrom(localStorage) ?? readFrom(sessionStorage);
}

export function savePrefs(prefs) {
  const value = JSON.stringify(prefs);
  try {
    localStorage.setItem(PREFS_KEY, value);
    return true;
  } catch {
    try {
      sessionStorage.setItem(PREFS_KEY, value);
      return true;
    } catch {
      return false;
    }
  }
}
