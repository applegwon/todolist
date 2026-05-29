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

const signupMutationState = {
  mutate: mockMutate,
  isPending: false,
  isError: false,
  error: null as unknown,
};

vi.mock('../hooks/useSignup', () => ({
  useSignup: () => signupMutationState,
}));

import { SignupForm } from './SignupForm';

function renderForm(ui: ReactNode = <SignupForm />) {
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
  signupMutationState.isPending = false;
  signupMutationState.isError = false;
  signupMutationState.error = null;
});

describe('SignupForm', () => {
  it('이메일 필드가 렌더링된다', () => {
    renderForm();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
  });

  it('비밀번호 필드가 렌더링된다', () => {
    renderForm();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
  });

  it('이름 필드가 렌더링된다', () => {
    renderForm();
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
  });

  it('유효하지 않은 이메일 입력 시 클라이언트 검증 에러가 표시된다', async () => {
    const { container } = renderForm();

    fireEvent.change(screen.getByLabelText(/이름/i), { target: { value: '홍길동' } });
    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/비밀번호/i), { target: { value: 'pass1234' } });
    // jsdom에서 type="email" built-in validation을 우회하여 form submit 이벤트 직접 발생
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText('유효하지 않은 이메일 형식입니다')).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('유효하지 않은 비밀번호 입력 시 클라이언트 검증 에러가 표시된다', async () => {
    const { container } = renderForm();

    fireEvent.change(screen.getByLabelText(/이름/i), { target: { value: '홍길동' } });
    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/비밀번호/i), { target: { value: 'short' } });
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(
        screen.getByText('비밀번호는 8자 이상, 영문 1자 이상, 숫자 1자 이상을 포함해야 합니다'),
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('유효한 데이터 입력 시 mutation이 호출된다', async () => {
    const { container } = renderForm();

    fireEvent.change(screen.getByLabelText(/이름/i), { target: { value: '홍길동' } });
    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/비밀번호/i), { target: { value: 'pass1234' } });
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass1234',
        name: '홍길동',
      });
    });
  });

  it('서버 에러 발생 시 에러 메시지가 표시된다', () => {
    signupMutationState.isError = true;
    signupMutationState.error = { code: 'EMAIL_DUPLICATE', status: 400, message: '' };

    renderForm();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('이미 사용 중인 이메일입니다');
  });

  it('isPending이 true일 때 버튼이 비활성화된다', () => {
    signupMutationState.isPending = true;

    renderForm();

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
