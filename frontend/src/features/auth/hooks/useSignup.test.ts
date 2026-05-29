import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { useSignup } from './useSignup';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../api', () => ({
  signup: vi.fn(),
}));

import { signup } from '../api';

const mockSignup = vi.mocked(signup);

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

beforeEach(() => {
  mockNavigate.mockReset();
  mockSignup.mockReset();
});

describe('useSignup', () => {
  it('성공 시 /login으로 navigate 호출한다', async () => {
    mockSignup.mockResolvedValueOnce({ id: 1, email: 'test@example.com', name: '홍길동' });

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'pass123', name: '홍길동' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('에러 발생 시 오류 상태가 설정된다', async () => {
    const error = { status: 400, code: 'EMAIL_DUPLICATE', message: '이미 사용 중인 이메일입니다' };
    mockSignup.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'pass123', name: '홍길동' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
