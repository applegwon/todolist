import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: {
      todo: {
        filterAll: '전체',
        notStarted: '미시작',
        inProgress: '진행중',
        completed: '완료',
        overdueOnly: '기한초과만 보기',
        categoryLabel: '카테고리',
        statusLabel: '상태',
      },
    },
  }),
}));

const mockSetFilters = vi.fn();
const mockResetFilters = vi.fn();

vi.mock('../todoStore', () => ({
  useTodoFilterStore: () => ({
    filters: {},
    setFilters: mockSetFilters,
    resetFilters: mockResetFilters,
  }),
}));

vi.mock('../../categories/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 1, name: '기본', user_id: null },
      { id: 2, name: '업무', user_id: 1 },
    ],
    isLoading: false,
    error: null,
  }),
}));

import { TodoFilters } from '../components/TodoFilters';

beforeEach(() => {
  mockSetFilters.mockReset();
  mockResetFilters.mockReset();
});

describe('TodoFilters', () => {
  it('카테고리 필터를 변경하면 setFilters가 호출된다', () => {
    render(<TodoFilters />);

    const categorySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(categorySelect, { target: { value: '2' } });

    expect(mockSetFilters).toHaveBeenCalledWith({ category: 2 });
  });

  it('상태 필터를 변경하면 setFilters가 호출된다', () => {
    render(<TodoFilters />);

    const statusSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(statusSelect, { target: { value: '진행중' } });

    expect(mockSetFilters).toHaveBeenCalledWith({ status: '진행중' });
  });

  it('기한초과 체크박스를 체크하면 setFilters가 호출된다', () => {
    render(<TodoFilters />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockSetFilters).toHaveBeenCalledWith({ overdue: 'true' });
  });
});
