import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

vi.mock('../../../lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock('../api', () => ({
  createCategory: vi.fn(),
}));

import { queryClient } from '../../../lib/queryClient';
import { createCategory } from '../api';
import { useCategoryCreate } from '../hooks/useCategoryCreate';

const mockInvalidateQueries = vi.mocked(queryClient.invalidateQueries);
const mockCreateCategory = vi.mocked(createCategory);

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  mockCreateCategory.mockReset();
  mockInvalidateQueries.mockReset();
});

describe('useCategoryCreate', () => {
  it('성공 시 categories 쿼리를 invalidate한다', async () => {
    const category = { id: 2, name: '업무', user_id: 1 };
    mockCreateCategory.mockResolvedValueOnce(category);

    const { result } = renderHook(() => useCategoryCreate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('업무');
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });

  it('mutationFn으로 createCategory를 호출한다', async () => {
    const category = { id: 2, name: '업무', user_id: 1 };
    mockCreateCategory.mockResolvedValueOnce(category);

    const { result } = renderHook(() => useCategoryCreate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('업무');
    });

    expect(mockCreateCategory).toHaveBeenCalledWith('업무', expect.anything());
  });
});
