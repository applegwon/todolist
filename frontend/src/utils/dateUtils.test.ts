import { describe, it, expect } from 'vitest';
import { isoToDateInputValue, formatDateDisplay } from './dateUtils';

describe('isoToDateInputValue', () => {
  it('null을 빈 문자열로 반환한다', () => {
    expect(isoToDateInputValue(null)).toBe('');
  });

  it('ISO 8601 datetime 문자열에서 YYYY-MM-DD를 추출한다', () => {
    expect(isoToDateInputValue('2026-05-28T10:30:00.000Z')).toBe('2026-05-28');
    expect(isoToDateInputValue('2026-01-01T00:00:00Z')).toBe('2026-01-01');
  });

  it('YYYY-MM-DD 형식 문자열을 그대로 반환한다', () => {
    expect(isoToDateInputValue('2026-05-28')).toBe('2026-05-28');
  });
});

describe('formatDateDisplay', () => {
  it('null을 대시(—)로 반환한다', () => {
    expect(formatDateDisplay(null)).toBe('—');
  });

  it('날짜 문자열을 한국어 형식으로 포맷한다', () => {
    const result = formatDateDisplay('2026-05-28');
    expect(result).toContain('2026');
    expect(result).toContain('05');
    expect(result).toContain('28');
  });
});
