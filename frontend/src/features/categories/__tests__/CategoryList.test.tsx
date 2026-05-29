import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
        delete: '삭제',
        edit: '수정',
      },
    },
  }),
}));

import { CategoryList } from '../components/CategoryList';

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

const defaultCategory: Category = { id: 1, name: '기본', user_id: null };
const userCategory: Category = { id: 2, name: '업무', user_id: 1 };

beforeEach(() => {
  mockOnEdit.mockReset();
  mockOnDelete.mockReset();
});

function renderList(categories: Category[]) {
  return render(
    <CategoryList
      categories={categories}
      onEdit={mockOnEdit}
      onDelete={mockOnDelete}
    />,
  );
}

describe('CategoryList', () => {
  it('카테고리 목록을 렌더링한다', () => {
    renderList([defaultCategory, userCategory]);

    expect(screen.getByText('기본')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
  });

  it('빈 목록일 때 empty-state 메시지를 표시한다', () => {
    renderList([]);

    expect(screen.getByText('사용자 정의 카테고리가 없습니다')).toBeInTheDocument();
  });

  it('기본 카테고리(user_id === null)의 수정 버튼은 disabled이다', () => {
    renderList([defaultCategory]);

    const editButtons = screen.getAllByRole('button', { name: /수정/i });
    expect(editButtons[0]).toBeDisabled();
  });

  it('기본 카테고리(user_id === null)의 삭제 버튼은 disabled이다', () => {
    renderList([defaultCategory]);

    const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
    expect(deleteButtons[0]).toBeDisabled();
  });

  it('사용자 카테고리의 수정 버튼 클릭 시 onEdit이 호출된다', () => {
    renderList([userCategory]);

    const editButtons = screen.getAllByRole('button', { name: /수정/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(userCategory);
  });

  it('사용자 카테고리의 삭제 버튼 클릭 시 onDelete가 호출된다', () => {
    renderList([userCategory]);

    const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(userCategory);
  });

  it('기본 카테고리와 사용자 카테고리가 함께 있을 때 사용자 카테고리만 활성화된다', () => {
    renderList([defaultCategory, userCategory]);

    const editButtons = screen.getAllByRole('button', { name: /수정/i });
    const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });

    expect(editButtons[0]).toBeDisabled();
    expect(editButtons[1]).not.toBeDisabled();
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).not.toBeDisabled();
  });
});
