const THEME_KEY = 'dailyos_theme';
const LEGACY_THEME_KEY = 'todaystracker_theme';

export function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function getSavedTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_KEY) ?? localStorage.getItem(LEGACY_THEME_KEY);
  if (saved !== null) {
    localStorage.setItem(THEME_KEY, saved);
  }
  return saved === 'light' ? 'light' : 'dark';
}
