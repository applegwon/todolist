import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'ko',
    setLanguage: vi.fn(),
    t: {
      profile: {
        language: '언어',
        korean: '한국어 (ko)',
        english: 'English (en)',
        japanese: '日本語 (ja)',
      },
    },
  }),
}));

import { LanguageSelector } from '../components/LanguageSelector';

const mockOnChange = vi.fn();

beforeEach(() => {
  mockOnChange.mockReset();
});

describe('LanguageSelector', () => {
  it('value가 ko일 때 ko 라디오가 checked이다', () => {
    render(<LanguageSelector value="ko" onChange={mockOnChange} />);

    const koRadio = screen.getByRole('radio', { name: /한국어/i }) as HTMLInputElement;
    const enRadio = screen.getByRole('radio', { name: /English/i }) as HTMLInputElement;

    expect(koRadio.checked).toBe(true);
    expect(enRadio.checked).toBe(false);
  });

  it('value가 en일 때 en 라디오가 checked이다', () => {
    render(<LanguageSelector value="en" onChange={mockOnChange} />);

    const koRadio = screen.getByRole('radio', { name: /한국어/i }) as HTMLInputElement;
    const enRadio = screen.getByRole('radio', { name: /English/i }) as HTMLInputElement;

    expect(koRadio.checked).toBe(false);
    expect(enRadio.checked).toBe(true);
  });

  it('ko 라디오 선택 시 onChange("ko")가 호출된다', () => {
    render(<LanguageSelector value="en" onChange={mockOnChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /한국어/i }));

    expect(mockOnChange).toHaveBeenCalledWith('ko');
  });

  it('en 라디오 선택 시 onChange("en")가 호출된다', () => {
    render(<LanguageSelector value="ko" onChange={mockOnChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /English/i }));

    expect(mockOnChange).toHaveBeenCalledWith('en');
  });

  it('value가 ja일 때 ja 라디오가 checked이다', () => {
    render(<LanguageSelector value="ja" onChange={mockOnChange} />);

    const koRadio = screen.getByRole('radio', { name: /한국어/i }) as HTMLInputElement;
    const enRadio = screen.getByRole('radio', { name: /English/i }) as HTMLInputElement;
    const jaRadio = screen.getByRole('radio', { name: /日本語/i }) as HTMLInputElement;

    expect(koRadio.checked).toBe(false);
    expect(enRadio.checked).toBe(false);
    expect(jaRadio.checked).toBe(true);
  });

  it('ja 라디오 선택 시 onChange("ja")가 호출된다', () => {
    render(<LanguageSelector value="ko" onChange={mockOnChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /日本語/i }));

    expect(mockOnChange).toHaveBeenCalledWith('ja');
  });

  it('ja 라디오가 렌더링된다', () => {
    render(<LanguageSelector value="ko" onChange={mockOnChange} />);

    expect(screen.getByRole('radio', { name: /日本語/i })).toBeInTheDocument();
  });
});
