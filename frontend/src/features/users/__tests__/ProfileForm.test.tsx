import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { User } from '../../../types';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'ko',
    setLanguage: vi.fn(),
    t: {
      profile: {
        title: '내 정보 수정',
        email: '이메일 (변경 불가)',
        name: '이름',
        newPassword: '새 비밀번호 (변경 시에만 입력)',
        passwordPlaceholder: '새 비밀번호를 입력하세요',
        theme: '테마',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        language: '언어',
        korean: '한국어 (ko)',
        english: 'English (en)',
        saveButton: '저장',
        saveSuccess: '저장되었습니다',
      },
      error: {
        serverError: '서버 오류가 발생했습니다',
      },
    },
  }),
}));

vi.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

const mockUpdateProfile = vi.fn();
const mutationState = {
  updateProfile: mockUpdateProfile,
  isPending: false,
  isSuccess: false,
  mutationError: null as unknown,
};

vi.mock('../hooks/useProfile', () => ({
  useProfileUpdate: () => mutationState,
}));

import { ProfileForm } from '../components/ProfileForm';

const mockProfile: User = {
  id: 1,
  email: 'test@test.com',
  name: '홍길동',
  theme: 'light',
  language: 'ko',
};

beforeEach(() => {
  mockUpdateProfile.mockReset();
  mutationState.isPending = false;
  mutationState.isSuccess = false;
  mutationState.mutationError = null;
});

describe('ProfileForm', () => {
  it('이메일이 읽기 전용으로 렌더링된다', () => {
    render(<ProfileForm profile={mockProfile} />);

    const emailInput = screen.getByDisplayValue('test@test.com') as HTMLInputElement;
    expect(emailInput.readOnly).toBe(true);
  });

  it('이름 변경이 가능하다', () => {
    render(<ProfileForm profile={mockProfile} />);

    const nameInput = screen.getByDisplayValue('홍길동') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '김철수' } });

    expect(nameInput.value).toBe('김철수');
  });

  it('저장 버튼 클릭 시 updateProfile이 호출된다', async () => {
    render(<ProfileForm profile={mockProfile} />);

    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: '홍길동', theme: 'light', language: 'ko' }),
      );
    });
  });

  it('isPending 중 저장 버튼이 disabled이다', () => {
    mutationState.isPending = true;

    render(<ProfileForm profile={mockProfile} />);

    const button = screen.getByRole('button', { name: /저장/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('isSuccess 시 성공 메시지가 표시된다', () => {
    mutationState.isSuccess = true;

    render(<ProfileForm profile={mockProfile} />);

    expect(screen.getByText('저장되었습니다')).toBeInTheDocument();
  });
});
