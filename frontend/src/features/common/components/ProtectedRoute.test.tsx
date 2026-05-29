import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../../auth/authStore';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
});

describe('ProtectedRoute', () => {
  it('토큰이 없을 때 /login으로 리다이렉트된다', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>보호된 컨텐츠</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
    expect(screen.queryByText('보호된 컨텐츠')).not.toBeInTheDocument();
  });

  it('토큰이 있을 때 children을 렌더링한다', () => {
    useAuthStore.setState({ token: 'valid-token', user: null });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>보호된 컨텐츠</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('보호된 컨텐츠')).toBeInTheDocument();
    expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument();
  });
});
