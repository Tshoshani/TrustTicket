/**
 * utils/theme.js - Applies the user's theme preference to the whole app.
 *
 * The chosen theme ("light" | "dark" | "auto") is stored in localStorage so it
 * survives page reloads and is applied instantly before the backend responds.
 * The resolved theme ("light" | "dark") is written to the <html> element's
 * data-theme attribute; the CSS in index.css reacts to [data-theme="dark"].
 *
 * "auto" follows the operating system preference (prefers-color-scheme).
 */

const STORAGE_KEY = 'theme';

// Resolve "auto" to an actual light/dark value based on the OS setting.
const resolveTheme = (theme) => {
  if (theme === 'auto') {
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return theme === 'dark' ? 'dark' : 'light';
};

// Apply a theme preference to the document and remember the choice.
export const applyTheme = (theme) => {
  const choice = ['light', 'dark', 'auto'].includes(theme) ? theme : 'light';
  localStorage.setItem(STORAGE_KEY, choice);
  document.documentElement.setAttribute('data-theme', resolveTheme(choice));
};

// Read the saved preference (defaults to "light").
export const getSavedTheme = () => localStorage.getItem(STORAGE_KEY) || 'light';

// Keep "auto" in sync if the OS theme changes while the app is open.
export const watchSystemTheme = () => {
  if (!window.matchMedia) return;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getSavedTheme() === 'auto') {
      document.documentElement.setAttribute('data-theme', resolveTheme('auto'));
    }
  };
  // addEventListener is the modern API; fall back to addListener for old browsers.
  if (mq.addEventListener) mq.addEventListener('change', handler);
  else if (mq.addListener) mq.addListener(handler);
};
