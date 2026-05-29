import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Todo, Category } from '../../../types';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: {
      todo: {
        titleLabel: '제목',
        titlePlaceholder: '할일 제목을 입력하세요',
        descriptionLabel: '설명',
        descriptionPlaceholder: '설명을 입력하세요 (선택)',
        categoryLabel: '카테고리',
        startDateLabel: '시작일자',
        endDateLabel: '종료일자',
        statusLabel: '상태',
        notStarted: '미시작',
        inProgress: '진행중',
        completed: '완료',
        createTodo: '할일 등록',
        editTodo: '할일 수정',
      },
      common: {
        save: '저장',
        cancel: '취소',
      },
      error: {
        required: '필수 항목입니다',
        dateRange: '종료일자는 시작일자보다 이전일 수 없습니다',
      },
    },
  }),
}));

const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();

vi.mock('../hooks/useTodoCreate', () => ({
  useTodoCreate: () => ({
    mutate: mockCreateMutate,
    isPending: false,
  }),
}));

vi.mock('../hooks/useTodoUpdate', () => ({
  useTodoUpdate: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
}));

vi.mock('../../../utils/dateUtils', () => ({
  isoToDateInputValue: (s: string | null) => s ? s.substring(0, 10) : '',
}));

import { TodoForm } from '../components/TodoForm';

const categories: Category[] = [
  { id: 1, name: '기본', user_id: null },
  { id: 2, name: '업무', user_id: 1 },
];

const mockTodo: Todo = {
  id: 1,
  title: '기존 할일 제목',
  description: '기존 설명',
  start_date: '2026-05-01T00:00:00.000Z',
  end_date: '2026-05-10T00:00:00.000Z',
  status: '진행중',
  category_id: 2,
  user_id: 1,
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
  is_overdue: false,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockCreateMutate.mockReset();
  mockUpdateMutate.mockReset();
});

describe('TodoForm - create 모드', () => {
  it('제목 없이 저장하면 필수 항목 에러가 표시된다', async () => {
    render(<TodoForm mode="create" categories={categories} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('제목 입력 후 저장하면 createMutate가 호출된다', async () => {
    render(<TodoForm mode="create" categories={categories} />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('할일 제목을 입력하세요'), {
      target: { value: '새 할일' },
    });
    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalled();
    });
  });
});

describe('TodoForm - edit 모드', () => {
  it('기존 데이터가 폼에 채워진다', () => {
    render(<TodoForm mode="edit" todo={mockTodo} categories={categories} />, { wrapper: createWrapper() });

    const titleInput = screen.getByPlaceholderText('할일 제목을 입력하세요') as HTMLInputElement;
    expect(titleInput.value).toBe('기존 할일 제목');
  });

  it('상태 드롭다운이 표시된다', () => {
    render(<TodoForm mode="edit" todo={mockTodo} categories={categories} />, { wrapper: createWrapper() });

    expect(screen.getByText('상태')).toBeInTheDocument();
  });
});

describe('TodoForm - 날짜 범위 검증', () => {
  it('종료일이 시작일보다 이전이면 에러가 표시된다', async () => {
    const { container } = render(<TodoForm mode="create" categories={categories} />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('할일 제목을 입력하세요'), {
      target: { value: '날짜 테스트' },
    });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    // start_date input
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-10' } });
    // end_date input
    fireEvent.change(dateInputs[1], { target: { value: '2026-05-01' } });

    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(screen.getByText('종료일자는 시작일자보다 이전일 수 없습니다')).toBeInTheDocument();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });
});
