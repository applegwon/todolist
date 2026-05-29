import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login } from './api';

vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

import { api } from '../../lib/api';

const mockPost = vi.mocked(api.post);

beforeEach(() => {
  mockPost.mockReset();
});

describe('auth api', () => {
  describe('signup', () => {
    it('api.post를 /auth/signup으로 호출한다', async () => {
      const request = { email: 'test@example.com', password: 'pass123', name: '홍길동' };
      const response = { id: 1, email: 'test@example.com', name: '홍길동' };
      mockPost.mockResolvedValueOnce(response);

      const result = await signup(request);

      expect(mockPost).toHaveBeenCalledWith('/api/auth/signup', request);
      expect(result).toEqual(response);
    });
  });

  describe('login', () => {
    it('api.post를 /auth/login으로 호출한다', async () => {
      const request = { email: 'test@example.com', password: 'pass123' };
      const response = {
        token: 'token-abc',
        user: { id: 1, email: 'test@example.com', name: '홍길동', theme: 'light', language: 'ko' },
      };
      mockPost.mockResolvedValueOnce(response);

      const result = await login(request);

      expect(mockPost).toHaveBeenCalledWith('/api/auth/login', request);
      expect(result).toEqual(response);
    });
  });
});
