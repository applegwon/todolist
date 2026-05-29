import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

vi.mock('../api', () => ({
  getTodos: vi.fn(),
}));

vi.mock('../todoStore', () => ({
  useTodoFilterStore: vi.fn(() => ({ filters: {} })),
}));

import { getTodos } from '../api';
import { useTodoFilterStore } from '../todoStore';
import { useTodos } from '../hooks/useTodos';

const mockGetTodos = vi.mocked(getTodos);
const mockUseTodoFilterStore = vi.mocked(useTodoFilterStore);

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  mockGetTodos.mockReset();
  mockUseTodoFilterStore.mockReturnValue({ filters: {}, setFilters: vi.fn(), resetFilters: vi.fn() });
});

describe('useTodos', () => {
  it('할일 목록을 반환한다', async () => {
    mockGetTodos.mockResolvedValueOnce([mockTodo]);

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.todos).toEqual([mockTodo]);
    expect(result.current.error).toBeNull();
  });

  it('useTodoFilterStore의 filters를 queryKey로 사용한다', async () => {
    const filters = { category: 2, status: '진행중' as const };
    mockUseTodoFilterStore.mockReturnValue({ filters, setFilters: vi.fn(), resetFilters: vi.fn() });
    mockGetTodos.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetTodos).toHaveBeenCalledWith(filters);
  });

  it('로딩 중에는 isLoading이 true이다', async () => {
    mockGetTodos.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });
});
