import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock('../api', () => ({
  createTodo: vi.fn(),
}));

import { queryClient } from '../../../lib/queryClient';
import { createTodo } from '../api';
import { useTodoCreate } from '../hooks/useTodoCreate';

const mockInvalidateQueries = vi.mocked(queryClient.invalidateQueries);
const mockCreateTodo = vi.mocked(createTodo);

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  mockCreateTodo.mockReset();
  mockInvalidateQueries.mockReset();
  mockNavigate.mockReset();
});

const mockTodo = {
  id: 1,
  title: '테스트 할일',
  description: null,
  start_date: null,
  end_date: null,
  status: '미시작' as const,
  category_id: 1,
  user_id: 1,
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
  is_overdue: false,
};

describe('useTodoCreate', () => {
  it('성공 시 todos 캐시를 invalidate한다', async () => {
    mockCreateTodo.mockResolvedValueOnce(mockTodo);

    const { result } = renderHook(() => useTodoCreate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ title: '테스트 할일' });
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });

  it('성공 시 / 로 navigate한다', async () => {
    mockCreateTodo.mockResolvedValueOnce(mockTodo);

    const { result } = renderHook(() => useTodoCreate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ title: '테스트 할일' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
