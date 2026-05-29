import { describe, it, expect, beforeEach } from 'vitest';
import { useTodoFilterStore } from './todoStore';

beforeEach(() => {
  useTodoFilterStore.setState({ filters: {} });
});

describe('useTodoFilterStore', () => {
  it('초기 상태에서 filters가 빈 객체이다', () => {
    const { filters } = useTodoFilterStore.getState();
    expect(filters).toEqual({});
  });

  it('setFilters 호출 시 기존 필터에 병합된다', () => {
    const { setFilters } = useTodoFilterStore.getState();
    setFilters({ status: '진행중' });

    const { filters } = useTodoFilterStore.getState();
    expect(filters.status).toBe('진행중');
  });

  it('setFilters를 여러 번 호출하면 필터가 누적 병합된다', () => {
    const { setFilters } = useTodoFilterStore.getState();
    setFilters({ status: '진행중' });
    setFilters({ category: 2 });

    const { filters } = useTodoFilterStore.getState();
    expect(filters.status).toBe('진행중');
    expect(filters.category).toBe(2);
  });

  it('resetFilters 호출 시 filters가 빈 객체로 초기화된다', () => {
    const { setFilters, resetFilters } = useTodoFilterStore.getState();
    setFilters({ status: '완료', category: 1 });
    resetFilters();

    const { filters } = useTodoFilterStore.getState();
    expect(filters).toEqual({});
  });
});
