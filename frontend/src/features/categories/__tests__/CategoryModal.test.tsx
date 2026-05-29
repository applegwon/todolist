import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Category } from '../../../types';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: {
      category: {
        title: '카테고리 관리',
        addCategory: '카테고리 추가',
        editCategory: '카테고리 수정',
        nameLabel: '카테고리 이름',
        namePlaceholder: '카테고리 이름을 입력하세요',
        defaultCategory: '기본',
        emptyList: '사용자 정의 카테고리가 없습니다',
        deleteConfirm: '이 카테고리를 삭제하시겠습니까? 소속 할일은 기본 카테고리로 이동됩니다',
        nameDuplicate: '이미 사용 중인 카테고리 이름입니다',
      },
      common: {
        save: '저장',
        cancel: '취소',
        close: '닫기',
        delete: '삭제',
        edit: '수정',
      },
    },
  }),
}));

const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();

const createMutationState = {
  mutate: mockCreateMutate,
  isPending: false,
  isError: false,
  error: null as unknown,
};

const updateMutationState = {
  mutate: mockUpdateMutate,
  isPending: false,
  isError: false,
  error: null as unknown,
};

vi.mock('../hooks/useCategoryCreate', () => ({
  useCategoryCreate: () => createMutationState,
}));

vi.mock('../hooks/useCategoryUpdate', () => ({
  useCategoryUpdate: () => updateMutationState,
}));

import { CategoryModal } from '../components/CategoryModal';

const mockOnClose = vi.fn();

const userCategory: Category = { id: 2, name: '업무', user_id: 1 };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  mockCreateMutate.mockReset();
  mockUpdateMutate.mockReset();
  mockOnClose.mockReset();
  createMutationState.isPending = false;
  createMutationState.isError = false;
  createMutationState.error = null;
  updateMutationState.isPending = false;
  updateMutationState.isError = false;
  updateMutationState.error = null;
});

describe('CategoryModal - create 모드', () => {
  it('카테고리 추가 제목이 표시된다', () => {
    const { container } = render(
      <CategoryModal mode="create" onClose={mockOnClose} />,
      { wrapper: createWrapper() },
    );
    expect(container).toBeInTheDocument();
    expect(screen.getByText('카테고리 추가')).toBeInTheDocument();
  });

  it('이름 입력 후 저장 시 createMutate가 호출된다', async () => {
    render(<CategoryModal mode="create" onClose={mockOnClose} />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('카테고리 이름을 입력하세요'), {
      target: { value: '새 카테고리' },
    });
    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith('새 카테고리', expect.anything());
    });
  });

  it('취소 버튼 클릭 시 onClose가 호출된다', () => {
    render(<CategoryModal mode="create" onClose={mockOnClose} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /취소/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('CATEGORY_NAME_DUPLICATE 에러가 표시된다', () => {
    createMutationState.isError = true;
    createMutationState.error = {
      status: 409,
      message: '이미 사용 중인 카테고리 이름입니다',
      code: 'CATEGORY_NAME_DUPLICATE',
    };

    render(<CategoryModal mode="create" onClose={mockOnClose} />, { wrapper: createWrapper() });

    expect(screen.getByText('이미 사용 중인 카테고리 이름입니다')).toBeInTheDocument();
  });
});

describe('CategoryModal - edit 모드', () => {
  it('카테고리 수정 제목이 표시된다', () => {
    render(
      <CategoryModal mode="edit" category={userCategory} onClose={mockOnClose} />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('카테고리 수정')).toBeInTheDocument();
  });

  it('edit 모드일 때 기존 이름이 초기값으로 채워진다', () => {
    render(
      <CategoryModal mode="edit" category={userCategory} onClose={mockOnClose} />,
      { wrapper: createWrapper() },
    );

    const input = screen.getByPlaceholderText('카테고리 이름을 입력하세요') as HTMLInputElement;
    expect(input.value).toBe('업무');
  });

  it('이름 수정 후 저장 시 updateMutate가 호출된다', async () => {
    render(
      <CategoryModal mode="edit" category={userCategory} onClose={mockOnClose} />,
      { wrapper: createWrapper() },
    );

    fireEvent.change(screen.getByPlaceholderText('카테고리 이름을 입력하세요'), {
      target: { value: '개인' },
    });
    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        { id: userCategory.id, name: '개인' },
        expect.anything(),
      );
    });
  });
});
