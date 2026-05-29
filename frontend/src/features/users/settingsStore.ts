import { create } from 'zustand';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'ko' | 'en' | 'ja';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ko' | 'en' | 'ja') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  language: 'ko',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setLanguage: (language) => {
    set({ language });
  },
}));
