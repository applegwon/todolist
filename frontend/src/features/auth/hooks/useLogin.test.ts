import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { useLogin } from './useLogin';

const mockNavigate = vi.fn();
const mockSetAuth = vi.fn();
const mockSetTheme = vi.fn();
const mockSetLanguage = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../api', () => ({
  login: vi.fn(),
}));

vi.mock('../authStore', () => ({
  useAuthStore: (selector: (state: { setAuth: typeof mockSetAuth }) => unknown) =>
    selector({ setAuth: mockSetAuth }),
}));

vi.mock('../../users/settingsStore', () => ({
  useSettingsStore: () => ({
    setTheme: mockSetTheme,
    setLanguage: mockSetLanguage,
  }),
}));

import { login } from '../api';

const mockLogin = vi.mocked(login);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children),
    );
  };
}

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: '홍길동',
  theme: 'dark' as const,
  language: 'en' as const,
};

beforeEach(() => {
  mockNavigate.mockReset();
  mockSetAuth.mockReset();
  mockSetTheme.mockReset();
  mockSetLanguage.mockReset();
  mockLogin.mockReset();
});

describe('useLogin', () => {
  it('성공 시 authStore.setAuth를 호출한다', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'token-abc', user: mockUser });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'pass123' });
    });

    expect(mockSetAuth).toHaveBeenCalledWith('token-abc', mockUser);
  });

  it('성공 시 settingsStore.setTheme과 setLanguage를 호출한다', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'token-abc', user: mockUser });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'pass123' });
    });

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('성공 시 /로 navigate 호출한다', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'token-abc', user: mockUser });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'pass123' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
