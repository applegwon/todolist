import { create } from 'zustand';
import type { TodoFilters } from '../../types';

interface TodoFilterState {
  filters: TodoFilters;
  setFilters: (filters: Partial<TodoFilters>) => void;
  resetFilters: () => void;
}

export const useTodoFilterStore = create<TodoFilterState>((set) => ({
  filters: {},
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: {} }),
}));
