import { useSettingsStore } from '../features/users/settingsStore';
import ko from '../i18n/ko.json';
import en from '../i18n/en.json';
import ja from '../i18n/ja.json';

const translations = { ko, en, ja } as const;

export function useLanguage() {
  const { language, setLanguage } = useSettingsStore();
  const t = translations[language];
  return { language, setLanguage, t };
}
