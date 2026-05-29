import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignup } from '../hooks/useSignup';
import { useLanguage } from '../../../hooks/useLanguage';
import { isValidEmail, isValidPassword } from '../../../utils/validators';
import type { ApiError } from '../../../types';

export function SignupForm() {
  const { t } = useLanguage();
  const signupMutation = useSignup();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const getServerErrorMessage = (error: unknown): string => {
    const apiError = error as ApiError;
    if (apiError?.code === 'EMAIL_DUPLICATE') {
      return t.auth.emailDuplicate;
    }
    return t.error.serverError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!isValidEmail(email)) {
      setEmailError(t.error.invalidEmail);
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!isValidPassword(password)) {
      setPasswordError(t.error.invalidPassword);
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    signupMutation.mutate({ email, password, name });
  };

  return (
    <>
      <div className="auth-logo">{t.header.appName}</div>
      <div className="auth-card">
        <h1 className="auth-title">{t.auth.signup}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">{t.auth.name}</label>
            <input
              id="name"
              type="text"
              className="input-outlined"
              placeholder={t.auth.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t.auth.email}</label>
            <input
              id="email"
              type="email"
              className={`input-outlined${emailError ? ' error' : ''}`}
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <span className="form-error">{emailError}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">{t.auth.password}</label>
            <input
              id="password"
              type="password"
              className={`input-outlined${passwordError ? ' error' : ''}`}
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <span className="form-error">{passwordError}</span>}
          </div>
          {signupMutation.isError && (
            <div className="error-alert" role="alert">
              {getServerErrorMessage(signupMutation.error)}
            </div>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? t.common.loading : t.auth.signupButton}
          </button>
        </form>
        <p className="auth-footer">
          {t.auth.alreadyHaveAccount}
          <Link to="/login">{t.auth.loginLink}</Link>
        </p>
      </div>
    </>
  );
}
