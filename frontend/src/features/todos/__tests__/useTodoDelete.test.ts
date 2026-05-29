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
  deleteTodo: vi.fn(),
}));

import { queryClient } from '../../../lib/queryClient';
import { deleteTodo } from '../api';
import { useTodoDelete } from '../hooks/useTodoDelete';

const mockInvalidateQueries = vi.mocked(queryClient.invalidateQueries);
const mockDeleteTodo = vi.mocked(deleteTodo);

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  mockDeleteTodo.mockReset();
  mockInvalidateQueries.mockReset();
});

describe('useTodoDelete', () => {
  it('성공 시 todos 캐시를 invalidate한다', async () => {
    mockDeleteTodo.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useTodoDelete(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(1);
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });
});
