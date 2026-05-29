import { api } from '../../lib/api';
import type { Category } from '../../types';

export function getCategories(): Promise<Category[]> {
  return api.get<Category[]>('/api/categories');
}

export function createCategory(name: string): Promise<Category> {
  return api.post<Category>('/api/categories', { name });
}

export function updateCategory(id: number, name: string): Promise<Category> {
  return api.patch<Category>(`/api/categories/${id}`, { name });
}

export function deleteCategory(id: number): Promise<void> {
  return api.del<void>(`/api/categories/${id}`);
}
