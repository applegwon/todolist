export interface User {
  id: number;
  email: string;
  name: string;
  theme: 'light' | 'dark';
  language: 'ko' | 'en' | 'ja';
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  user_id: number | null;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: '미시작' | '진행중' | '완료';
  category_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code: ErrorCode;
}

export type ErrorCode =
  | 'MISSING_FIELD'
  | 'INVALID_FORMAT'
  | 'EMAIL_DUPLICATE'
  | 'INVALID_CREDENTIALS'
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'CATEGORY_NAME_DUPLICATE'
  | 'TODO_FORBIDDEN'
  | 'INVALID_DATE_RANGE';

export interface ApiResponse<T> {
  data: T;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  status?: '미시작' | '진행중' | '완료';
}

export interface TodoFilters {
  category?: number;
  status?: '미시작' | '진행중' | '완료';
  overdue?: 'true';
}

export interface UpdateUserRequest {
  name?: string;
  password?: string;
  theme?: 'light' | 'dark';
  language?: 'ko' | 'en' | 'ja';
}
