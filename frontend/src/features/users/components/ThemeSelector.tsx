import { useTheme } from '../../../hooks/useTheme';
import { useLanguage } from '../../../hooks/useLanguage';

interface Props {
  value: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
}

export function ThemeSelector({ value, onChange }: Props) {
  const { setTheme } = useTheme();
  const { t } = useLanguage();

  const handleChange = (theme: 'light' | 'dark') => {
    setTheme(theme);
    onChange(theme);
  };

  return (
    <div className="form-group">
      <span className="form-label">{t.profile.theme}</span>
      <div>
        <label>
          <input
            type="radio"
            name="theme"
            value="light"
            checked={value === 'light'}
            onChange={() => handleChange('light')}
          />
          {' '}{t.profile.lightMode}
        </label>
        {' '}
        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={value === 'dark'}
            onChange={() => handleChange('dark')}
          />
          {' '}{t.profile.darkMode}
        </label>
      </div>
    </div>
  );
}
