import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

vi.mock('../../../lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock('../api', () => ({
  getMe: vi.fn(),
  updateMe: vi.fn(),
}));

vi.mock('../../auth/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ setAuth: vi.fn() })),
  },
}));

import { getMe, updateMe } from '../api';
import { queryClient } from '../../../lib/queryClient';
import { useProfileQuery, useProfileUpdate } from '../hooks/useProfile';

const mockGetMe = vi.mocked(getMe);
const mockUpdateMe = vi.mocked(updateMe);
const mockInvalidateQueries = vi.mocked(queryClient.invalidateQueries);

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  mockGetMe.mockReset();
  mockUpdateMe.mockReset();
  mockInvalidateQueries.mockReset();
});

describe('useProfileQuery', () => {
  it('성공 시 profile을 반환한다', async () => {
    const user = { id: 1, email: 'test@test.com', name: '홍길동', theme: 'light' as const, language: 'ko' as const };
    mockGetMe.mockResolvedValueOnce(user);

    const { result } = renderHook(() => useProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(user);
    expect(result.current.error).toBeNull();
  });

  it('로딩 중에는 isLoading이 true이다', async () => {
    mockGetMe.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useProfileQuery(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('에러 발생 시 error를 반환한다', async () => {
    const error = { status: 500, message: '서버 오류', code: 'INTERNAL_ERROR' };
    mockGetMe.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe('useProfileUpdate', () => {
  it('성공 시 onSuccess가 호출된다', async () => {
    const user = { id: 1, email: 'test@test.com', name: '변경', theme: 'dark' as const, language: 'en' as const };
    mockUpdateMe.mockResolvedValueOnce(user);

    const { result } = renderHook(() => useProfileUpdate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updateProfile({ name: '변경' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile'] });
  });

  it('에러 발생 시 mutationError를 반환한다', async () => {
    const error = { status: 500, message: '서버 오류', code: 'INTERNAL_ERROR' };
    mockUpdateMe.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProfileUpdate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updateProfile({ name: '변경' });
    });

    await waitFor(() => {
      expect(result.current.mutationError).toBeTruthy();
    });
  });
});
