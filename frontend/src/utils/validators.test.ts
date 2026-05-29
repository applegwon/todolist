import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword } from './validators';

describe('isValidEmail', () => {
  it('유효한 이메일을 true로 반환한다', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.kr')).toBe(true);
    expect(isValidEmail('apple.gwon@gmail.com')).toBe(true);
  });

  it('@가 없는 이메일을 false로 반환한다', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('도메인이 없는 이메일을 false로 반환한다', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('공백이 포함된 이메일을 false로 반환한다', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });

  it('빈 문자열을 false로 반환한다', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('유효한 비밀번호를 true로 반환한다', () => {
    expect(isValidPassword('password1')).toBe(true);
    expect(isValidPassword('Abcdefg1')).toBe(true);
    expect(isValidPassword('abc12345')).toBe(true);
  });

  it('8자 미만 비밀번호를 false로 반환한다', () => {
    expect(isValidPassword('abc123')).toBe(false);
    expect(isValidPassword('a1b2c3d')).toBe(false);
  });

  it('공백이 포함된 비밀번호를 false로 반환한다', () => {
    expect(isValidPassword('abc 1234')).toBe(false);
    expect(isValidPassword('abcde 12')).toBe(false);
  });

  it('영문이 없는 비밀번호를 false로 반환한다', () => {
    expect(isValidPassword('12345678')).toBe(false);
    expect(isValidPassword('1234567890')).toBe(false);
  });

  it('숫자가 없는 비밀번호를 false로 반환한다', () => {
    expect(isValidPassword('abcdefgh')).toBe(false);
    expect(isValidPassword('ABCDEFGH')).toBe(false);
  });
});
