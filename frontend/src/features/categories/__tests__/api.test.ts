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
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

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

describe('categories api', () => {
  describe('getCategories', () => {
    it('api.get을 /api/categories로 호출한다', async () => {
      const categories = [
        { id: 1, name: '기본', user_id: null },
        { id: 2, name: '업무', user_id: 1 },
      ];
      mockGet.mockResolvedValueOnce(categories);

      const result = await getCategories();

      expect(mockGet).toHaveBeenCalledWith('/api/categories');
      expect(result).toEqual(categories);
    });
  });

  describe('createCategory', () => {
    it('api.post를 /api/categories로 name과 함께 호출한다', async () => {
      const category = { id: 2, name: '업무', user_id: 1 };
      mockPost.mockResolvedValueOnce(category);

      const result = await createCategory('업무');

      expect(mockPost).toHaveBeenCalledWith('/api/categories', { name: '업무' });
      expect(result).toEqual(category);
    });
  });

  describe('updateCategory', () => {
    it('api.patch를 /api/categories/:id로 name과 함께 호출한다', async () => {
      const category = { id: 2, name: '개인', user_id: 1 };
      mockPatch.mockResolvedValueOnce(category);

      const result = await updateCategory(2, '개인');

      expect(mockPatch).toHaveBeenCalledWith('/api/categories/2', { name: '개인' });
      expect(result).toEqual(category);
    });
  });

  describe('deleteCategory', () => {
    it('api.del을 /api/categories/:id로 호출한다', async () => {
      mockDel.mockResolvedValueOnce(undefined);

      await deleteCategory(2);

      expect(mockDel).toHaveBeenCalledWith('/api/categories/2');
    });
  });
});
