import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Category } from '../../../types';
import { CategorySelector } from '../components/CategorySelector';

const mockOnChange = vi.fn();

const categories: Category[] = [
  { id: 1, name: '기본', user_id: null },
  { id: 2, name: '업무', user_id: 1 },
  { id: 3, name: '개인', user_id: 1 },
];

beforeEach(() => {
  mockOnChange.mockReset();
});

describe('CategorySelector', () => {
  it('카테고리 옵션들이 렌더링된다', () => {
    render(
      <CategorySelector value={1} onChange={mockOnChange} categories={categories} />,
    );

    expect(screen.getByRole('option', { name: '기본' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '업무' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '개인' })).toBeInTheDocument();
  });

  it('value에 해당하는 옵션이 선택되어 있다', () => {
    render(
      <CategorySelector value={2} onChange={mockOnChange} categories={categories} />,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });

  it('선택 변경 시 onChange가 숫자 id로 호출된다', () => {
    render(
      <CategorySelector value={1} onChange={mockOnChange} categories={categories} />,
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } });

    expect(mockOnChange).toHaveBeenCalledWith(3);
  });

  it('value가 undefined일 때 렌더링된다', () => {
    render(
      <CategorySelector value={undefined} onChange={mockOnChange} categories={categories} />,
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
