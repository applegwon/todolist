import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

beforeEach(() => {
  useSettingsStore.setState({ theme: 'light', language: 'ko' });
});

describe('useSettingsStore', () => {
  it('초기 상태에서 theme은 light, language는 ko이다', () => {
    const { theme, language } = useSettingsStore.getState();
    expect(theme).toBe('light');
    expect(language).toBe('ko');
  });

  it('setTheme 호출 시 theme이 변경된다', () => {
    const { setTheme } = useSettingsStore.getState();
    setTheme('dark');

    const { theme } = useSettingsStore.getState();
    expect(theme).toBe('dark');
  });

  it('setTheme 호출 시 document의 data-theme 속성이 변경된다', () => {
    const { setTheme } = useSettingsStore.getState();
    setTheme('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setLanguage 호출 시 language가 변경된다', () => {
    const { setLanguage } = useSettingsStore.getState();
    setLanguage('en');

    const { language } = useSettingsStore.getState();
    expect(language).toBe('en');
  });
});
