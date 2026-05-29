import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useLanguage } from '../../../hooks/useLanguage';
import type { ApiError } from '../../../types';

export function LoginForm() {
  const { t } = useLanguage();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getErrorMessage = (error: unknown): string => {
    const apiError = error as ApiError;
    if (apiError?.code === 'INVALID_CREDENTIALS') {
      return t.auth.invalidCredentials;
    }
    return t.error.serverError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <>
      <div className="auth-logo">{t.header.appName}</div>
      <div className="auth-card">
        <h1 className="auth-title">{t.auth.login}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t.auth.email}</label>
            <input
              id="email"
              type="email"
              className="input-outlined"
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">{t.auth.password}</label>
            <input
              id="password"
              type="password"
              className="input-outlined"
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginMutation.isError && (
            <div className="error-alert" role="alert">
              {getErrorMessage(loginMutation.error)}
            </div>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t.common.loading : t.auth.loginButton}
          </button>
        </form>
        <p className="auth-footer">
          {t.auth.noAccount}
          <Link to="/signup">{t.auth.signupLink}</Link>
        </p>
      </div>
    </>
  );
}
