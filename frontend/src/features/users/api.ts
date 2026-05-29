import { api } from '../../lib/api';
import type { User, UpdateUserRequest } from '../../types';

export function getMe(): Promise<User> {
  return api.get<User>('/api/users/me');
}

export function updateMe(data: UpdateUserRequest): Promise<User> {
  return api.patch<User>('/api/users/me', data);
}
