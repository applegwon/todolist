import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Todo } from '../../../types';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: {
      todo: {
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

import { TodoCard } from '../components/TodoCard';

const baseTodo: Todo = {
  id: 1,
  title: '테스트 할일',
  description: null,
  start_date: null,
  end_date: null,
  status: '미시작',
  category_id: 1,
  user_id: 1,
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
  is_overdue: false,
};

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

beforeEach(() => {
  mockOnEdit.mockReset();
  mockOnDelete.mockReset();
});

describe('TodoCard', () => {
  it('기한초과 카드에 card.overdue 클래스와 badge-overdue 뱃지가 표시된다', () => {
    const overdueTodo: Todo = { ...baseTodo, is_overdue: true };

    const { container } = render(
      <TodoCard todo={overdueTodo} categoryName="업무" onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(container.querySelector('.card.overdue')).toBeInTheDocument();
    expect(container.querySelector('.badge-overdue')).toBeInTheDocument();
  });

  it('완료 카드에 card.completed 클래스가 적용된다', () => {
    const completedTodo: Todo = { ...baseTodo, status: '완료' };

    const { container } = render(
      <TodoCard todo={completedTodo} categoryName="업무" onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(container.querySelector('.card.completed')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 onEdit이 호출된다', () => {
    render(
      <TodoCard todo={baseTodo} categoryName="업무" onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /수정/i }));

    expect(mockOnEdit).toHaveBeenCalledWith(baseTodo);
  });

  it('삭제 버튼 클릭 시 onDelete가 호출된다', () => {
    render(
      <TodoCard todo={baseTodo} categoryName="업무" onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /삭제/i }));

    expect(mockOnDelete).toHaveBeenCalledWith(baseTodo);
  });

  it('미시작 상태에 badge-default 클래스가 적용된다', () => {
    const { container } = render(
      <TodoCard todo={baseTodo} categoryName="업무" onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(container.querySelector('.badge-default')).toBeInTheDocument();
  });

  it('진행중 상태에 badge-progress 클래스가 적용된다', () => {
    const inProgressTodo: Todo = { ...baseTodo, status: '진행중' };

    const { container } = render(
      <TodoCard todo={inProgressTodo} categoryName="업무" onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(container.querySelector('.badge-progress')).toBeInTheDocument();
  });
});
