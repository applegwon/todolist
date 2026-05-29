import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../api';
import { useTodoFilterStore } from '../todoStore';

export function useTodos() {
  const { filters } = useTodoFilterStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', filters],
    queryFn: () => getTodos(filters),
  });
  return { todos: data ?? [], isLoading, error };
}
