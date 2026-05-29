import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '../../types';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  name: '테스트 유저',
  theme: 'light',
  language: 'ko',
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
});

describe('useAuthStore', () => {
  it('초기 상태에서 token과 user가 null이다', () => {
    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  it('setAuth 호출 시 token과 user를 저장하고 localStorage에도 저장한다', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth('test-token-123', mockUser);

    const { token, user } = useAuthStore.getState();
    expect(token).toBe('test-token-123');
    expect(user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('test-token-123');
  });

  it('clearAuth 호출 시 token과 user를 null로 초기화하고 localStorage에서도 제거한다', () => {
    const { setAuth, clearAuth } = useAuthStore.getState();
    setAuth('test-token-123', mockUser);
    clearAuth();

    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
