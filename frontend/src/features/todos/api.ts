import { api } from '../../lib/api';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilters } from '../../types';

function buildQueryString(filters: TodoFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', String(filters.category));
  if (filters.status) params.set('status', filters.status);
  if (filters.overdue) params.set('overdue', filters.overdue);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function getTodos(filters: TodoFilters = {}): Promise<Todo[]> {
  return api.get<Todo[]>(`/api/todos${buildQueryString(filters)}`);
}

export function createTodo(data: CreateTodoRequest): Promise<Todo> {
  return api.post<Todo>('/api/todos', data);
}

export function updateTodo(id: number, data: UpdateTodoRequest): Promise<Todo> {
  return api.patch<Todo>(`/api/todos/${id}`, data);
}

export function deleteTodo(id: number): Promise<void> {
  return api.del<void>(`/api/todos/${id}`);
}
