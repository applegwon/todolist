import { api } from '../../lib/api';
import type { User } from '../../types';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface SignupResponse {
  id: number;
  email: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export function signup(data: SignupRequest): Promise<SignupResponse> {
  return api.post<SignupResponse>('/api/auth/signup', data);
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/auth/login', data);
}
