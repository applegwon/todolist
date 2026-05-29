import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Todo, Category } from '../../../types';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: {
      todo: {
        emptyList: '등록된 할일이 없습니다',
        notStarted: '미시작',
        inProgress: '진행중',
        completed: '완료',
        overdue: '기한초과',
      },
      common: {
        edit: '수정',
        delete: '삭제',
      },
    },
  }),
}));

vi.mock('../../../utils/dateUtils', () => ({
  formatDateDisplay: (d: string | null) => d ?? '—',
}));

import { TodoList } from '../components/TodoList';

const categories: Category[] = [
  { id: 1, name: '기본', user_id: null },
  { id: 2, name: '업무', user_id: 1 },
];

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

const makeTodo = (id: number, title: string): Todo => ({
  id,
  title,
  description: null,
  start_date: null,
  end_date: null,
  status: '미시작',
  category_id: 1,
  user_id: 1,
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
  is_overdue: false,
});

describe('TodoList', () => {
  it('빈 목록일 때 empty-state 메시지를 표시한다', () => {
    render(
      <TodoList todos={[]} categories={categories} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(screen.getByText('등록된 할일이 없습니다')).toBeInTheDocument();
  });

  it('할일 목록이 있을 때 카드를 렌더링한다', () => {
    const todos = [makeTodo(1, '첫 번째 할일'), makeTodo(2, '두 번째 할일')];

    render(
      <TodoList todos={todos} categories={categories} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(screen.getByText('첫 번째 할일')).toBeInTheDocument();
    expect(screen.getByText('두 번째 할일')).toBeInTheDocument();
  });
});
