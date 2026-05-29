import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/authStore';
import { useLanguage } from '../../../hooks/useLanguage';

export function Header() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="header">
      <NavLink to="/" className="header__logo">
        {t.header.appName}
      </NavLink>
      <nav className="header__nav">
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `header__nav-link${isActive ? ' active' : ''}`
          }
        >
          {t.header.categories}
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `header__nav-link${isActive ? ' active' : ''}`
          }
        >
          {t.header.profile}
        </NavLink>
        <button className="header__nav-link btn-ghost" onClick={handleLogout}>
          {t.common.logout}
        </button>
      </nav>
    </header>
  );
}
