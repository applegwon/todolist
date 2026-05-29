import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

vi.mock('../api', () => ({
  getCategories: vi.fn(),
}));

import { getCategories } from '../api';
import { useCategories } from '../hooks/useCategories';

const mockGetCategories = vi.mocked(getCategories);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  mockGetCategories.mockReset();
});

describe('useCategories', () => {
  it('카테고리 목록을 반환한다', async () => {
    const categories = [
      { id: 1, name: '기본', user_id: null },
      { id: 2, name: '업무', user_id: 1 },
    ];
    mockGetCategories.mockResolvedValueOnce(categories);

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(categories);
    expect(result.current.error).toBeNull();
  });

  it('로딩 중에는 isLoading이 true이다', async () => {
    mockGetCategories.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('에러 발생 시 error를 반환한다', async () => {
    const error = { status: 500, message: '서버 오류', code: 'INTERNAL_ERROR' };
    mockGetCategories.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
