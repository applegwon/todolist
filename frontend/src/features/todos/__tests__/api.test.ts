import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
  },
}));

import { api } from '../../../lib/api';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../api';

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);
const mockPatch = vi.mocked(api.patch);
const mockDel = vi.mocked(api.del);

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockPatch.mockReset();
  mockDel.mockReset();
});

const mockTodo = {
  id: 1,
  title: '테스트 할일',
  description: null,
  start_date: null,
  end_date: null,
  status: '미시작' as const,
  category_id: 1,
  user_id: 1,
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
  is_overdue: false,
};

describe('todos api', () => {
  describe('getTodos', () => {
    it('필터 없이 호출하면 /api/todos로 요청한다', async () => {
      mockGet.mockResolvedValueOnce([mockTodo]);

      const result = await getTodos();

      expect(mockGet).toHaveBeenCalledWith('/api/todos');
      expect(result).toEqual([mockTodo]);
    });

    it('category 필터를 적용하면 쿼리스트링에 포함된다', async () => {
      mockGet.mockResolvedValueOnce([mockTodo]);

      await getTodos({ category: 2 });

      expect(mockGet).toHaveBeenCalledWith('/api/todos?category=2');
    });

    it('status 필터를 적용하면 쿼리스트링에 포함된다', async () => {
      mockGet.mockResolvedValueOnce([mockTodo]);

      await getTodos({ status: '진행중' });

      expect(mockGet).toHaveBeenCalledWith('/api/todos?status=%EC%A7%84%ED%96%89%EC%A4%91');
    });

    it('overdue 필터를 적용하면 쿼리스트링에 포함된다', async () => {
      mockGet.mockResolvedValueOnce([mockTodo]);

      await getTodos({ overdue: 'true' });

      expect(mockGet).toHaveBeenCalledWith('/api/todos?overdue=true');
    });
  });

  describe('createTodo', () => {
    it('api.post를 /api/todos로 data와 함께 호출한다', async () => {
      mockPost.mockResolvedValueOnce(mockTodo);

      const result = await createTodo({ title: '테스트 할일' });

      expect(mockPost).toHaveBeenCalledWith('/api/todos', { title: '테스트 할일' });
      expect(result).toEqual(mockTodo);
    });
  });

  describe('updateTodo', () => {
    it('api.patch를 /api/todos/:id로 data와 함께 호출한다', async () => {
      const updated = { ...mockTodo, status: '완료' as const };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await updateTodo(1, { status: '완료' });

      expect(mockPatch).toHaveBeenCalledWith('/api/todos/1', { status: '완료' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTodo', () => {
    it('api.del을 /api/todos/:id로 호출한다', async () => {
      mockDel.mockResolvedValueOnce(undefined);

      await deleteTodo(1);

      expect(mockDel).toHaveBeenCalledWith('/api/todos/1');
    });
  });
});
