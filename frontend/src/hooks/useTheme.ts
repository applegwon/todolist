import { useEffect } from 'react';
import { useSettingsStore } from '../features/users/settingsStore';

export function useTheme() {
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
