import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'ko',
    setLanguage: vi.fn(),
    t: {
      profile: {
        theme: '테마',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
      },
    },
  }),
}));

import { ThemeSelector } from '../components/ThemeSelector';

const mockOnChange = vi.fn();

beforeEach(() => {
  mockOnChange.mockReset();
});

describe('ThemeSelector', () => {
  it('value가 light일 때 light 라디오가 checked이다', () => {
    render(<ThemeSelector value="light" onChange={mockOnChange} />);

    const lightRadio = screen.getByRole('radio', { name: /Light Mode/i }) as HTMLInputElement;
    const darkRadio = screen.getByRole('radio', { name: /Dark Mode/i }) as HTMLInputElement;

    expect(lightRadio.checked).toBe(true);
    expect(darkRadio.checked).toBe(false);
  });

  it('value가 dark일 때 dark 라디오가 checked이다', () => {
    render(<ThemeSelector value="dark" onChange={mockOnChange} />);

    const lightRadio = screen.getByRole('radio', { name: /Light Mode/i }) as HTMLInputElement;
    const darkRadio = screen.getByRole('radio', { name: /Dark Mode/i }) as HTMLInputElement;

    expect(lightRadio.checked).toBe(false);
    expect(darkRadio.checked).toBe(true);
  });

  it('light 라디오 선택 시 onChange("light")가 호출된다', () => {
    render(<ThemeSelector value="dark" onChange={mockOnChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /Light Mode/i }));

    expect(mockOnChange).toHaveBeenCalledWith('light');
  });

  it('dark 라디오 선택 시 onChange("dark")가 호출된다', () => {
    render(<ThemeSelector value="light" onChange={mockOnChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /Dark Mode/i }));

    expect(mockOnChange).toHaveBeenCalledWith('dark');
  });
});
