import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

const mockMutate = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// isPending/isError/error 상태를 제어할 수 있도록 ref 객체 사용
const loginMutationState = {
  mutate: mockMutate,
  isPending: false,
  isError: false,
  error: null as unknown,
};

vi.mock('../hooks/useLogin', () => ({
  useLogin: () => loginMutationState,
}));

import { LoginForm } from './LoginForm';

function renderForm(ui: ReactNode = <LoginForm />) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockMutate.mockReset();
  mockNavigate.mockReset();
  loginMutationState.isPending = false;
  loginMutationState.isError = false;
  loginMutationState.error = null;
});

describe('LoginForm', () => {
  it('이메일 필드가 렌더링된다', () => {
    renderForm();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
  });

  it('비밀번호 필드가 렌더링된다', () => {
    renderForm();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
  });

  it('이메일 필드의 type이 email이다', () => {
    renderForm();
    expect(screen.getByLabelText(/이메일/i)).toHaveAttribute('type', 'email');
  });

  it('비밀번호 필드의 type이 password이다', () => {
    renderForm();
    expect(screen.getByLabelText(/비밀번호/i)).toHaveAttribute('type', 'password');
  });

  it('로그인 버튼 클릭 시 mutation이 호출된다', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/비밀번호/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass123',
      });
    });
  });

  it('isError가 true일 때 에러 메시지가 표시된다', () => {
    loginMutationState.isError = true;
    loginMutationState.error = { code: 'INVALID_CREDENTIALS', status: 401, message: '' };

    renderForm();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('이메일 또는 비밀번호가 올바르지 않습니다');
  });

  it('isPending이 true일 때 버튼이 비활성화된다', () => {
    loginMutationState.isPending = true;

    renderForm();

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
