import { Header } from '../../common/components/Header';
import { useProfileQuery } from '../hooks/useProfile';
import { ProfileForm } from '../components/ProfileForm';
import { useLanguage } from '../../../hooks/useLanguage';

export function ProfilePage() {
  const { t } = useLanguage();
  const { profile, isLoading, error } = useProfileQuery();

  return (
    <div className="app">
      <Header />
      <main className="page-content">
        <h1>{t.profile.title}</h1>
        {isLoading && <div>{t.common.loading}</div>}
        {error && <div className="error-alert">{t.common.error}</div>}
        {profile && <ProfileForm profile={profile} />}
      </main>
    </div>
  );
}
