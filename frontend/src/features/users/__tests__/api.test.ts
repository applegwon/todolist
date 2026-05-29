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
import { getMe, updateMe } from '../api';

const mockGet = vi.mocked(api.get);
const mockPatch = vi.mocked(api.patch);

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
});

describe('users api', () => {
  describe('getMe', () => {
    it('api.get을 /api/users/me로 호출한다', async () => {
      const user = { id: 1, email: 'test@test.com', name: '홍길동', theme: 'light' as const, language: 'ko' as const };
      mockGet.mockResolvedValueOnce(user);

      const result = await getMe();

      expect(mockGet).toHaveBeenCalledWith('/api/users/me');
      expect(result).toEqual(user);
    });
  });

  describe('updateMe', () => {
    it('api.patch를 /api/users/me로 data와 함께 호출한다', async () => {
      const user = { id: 1, email: 'test@test.com', name: '변경', theme: 'dark' as const, language: 'en' as const };
      const data = { name: '변경', theme: 'dark' as const, language: 'en' as const };
      mockPatch.mockResolvedValueOnce(user);

      const result = await updateMe(data);

      expect(mockPatch).toHaveBeenCalledWith('/api/users/me', data);
      expect(result).toEqual(user);
    });
  });
});
