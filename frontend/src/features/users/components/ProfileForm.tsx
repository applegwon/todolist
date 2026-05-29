import { useState, useEffect } from 'react';
import type { User } from '../../../types';
import { useProfileUpdate } from '../hooks/useProfile';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../../../hooks/useLanguage';

interface Props {
  profile: User;
}

export function ProfileForm({ profile }: Props) {
  const { t } = useLanguage();
  const { updateProfile, isPending, isSuccess, mutationError } = useProfileUpdate();

  const [name, setName] = useState(profile.name);
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(profile.theme);
  const [language, setLanguage] = useState<'ko' | 'en' | 'ja'>(profile.language);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      theme,
      language,
      ...(password ? { password } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {mutationError && (
        <div className="error-alert">{t.error.serverError}</div>
      )}
      {showSuccess && (
        <div>{t.profile.saveSuccess}</div>
      )}

      <div className="form-group">
        <label className="form-label">{t.profile.email}</label>
        <input
          className="input-outlined"
          type="email"
          value={profile.email}
          readOnly
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.profile.name}</label>
        <input
          className="input-outlined"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.profile.newPassword}</label>
        <input
          className="input-outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.profile.passwordPlaceholder}
        />
      </div>

      <ThemeSelector value={theme} onChange={setTheme} />
      <LanguageSelector value={language} onChange={setLanguage} />

      <button
        type="submit"
        className="btn-primary"
        disabled={isPending}
      >
        {t.profile.saveButton}
      </button>
    </form>
  );
}
