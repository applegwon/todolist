'use strict';

const path = require('path');

const { validateEmail, validatePassword } = require(path.join(__dirname, '../../src/utils/validators'));
const AppError = require(path.join(__dirname, '../../src/utils/errors'));

// ────────────────────────────────────────────────────────────────
// validators 단위 테스트
// 대상: src/utils/validators.js
// ────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────
// 1. validateEmail
// ────────────────────────────────────────────────────────────────
describe('validateEmail', () => {
  describe('유효한 이메일', () => {
    test('user@example.com → 예외 없이 통과해야 한다', () => {
      expect(() => validateEmail('user@example.com')).not.toThrow();
    });

    test('user.name+tag@sub.domain.co.kr → 예외 없이 통과해야 한다', () => {
      expect(() => validateEmail('user.name+tag@sub.domain.co.kr')).not.toThrow();
    });

    test('a@b.io → 예외 없이 통과해야 한다', () => {
      expect(() => validateEmail('a@b.io')).not.toThrow();
    });
  });

  describe('유효하지 않은 이메일 → AppError throw', () => {
    test('도메인 없는 이메일(user@) → AppError를 throw해야 한다', () => {
      expect(() => validateEmail('user@')).toThrow(AppError);
    });

    test('@ 없는 문자열(userexample.com) → AppError를 throw해야 한다', () => {
      expect(() => validateEmail('userexample.com')).toThrow(AppError);
    });

    test('빈 문자열("") → AppError를 throw해야 한다', () => {
      expect(() => validateEmail('')).toThrow(AppError);
    });

    test('null → AppError를 throw해야 한다', () => {
      expect(() => validateEmail(null)).toThrow(AppError);
    });

    test('undefined → AppError를 throw해야 한다', () => {
      expect(() => validateEmail(undefined)).toThrow(AppError);
    });

    test('@만 있는 문자열(@) → AppError를 throw해야 한다', () => {
      expect(() => validateEmail('@')).toThrow(AppError);
    });

    test('공백만 있는 문자열(" ") → AppError를 throw해야 한다', () => {
      expect(() => validateEmail('   ')).toThrow(AppError);
    });
  });
});

// ────────────────────────────────────────────────────────────────
// 2. validatePassword
// ────────────────────────────────────────────────────────────────
describe('validatePassword', () => {
  describe('유효한 비밀번호', () => {
    test('8자 이상 영문+숫자 조합(abc12345) → 예외 없이 통과해야 한다', () => {
      expect(() => validatePassword('abc12345')).not.toThrow();
    });

    test('영문+숫자 혼합 12자(password123) → 예외 없이 통과해야 한다', () => {
      expect(() => validatePassword('password123')).not.toThrow();
    });

    test('대소문자+숫자 조합(AbcDef12) → 예외 없이 통과해야 한다', () => {
      expect(() => validatePassword('AbcDef12')).not.toThrow();
    });
  });

  describe('유효하지 않은 비밀번호 → AppError throw', () => {
    test('7자 이하 영문+숫자(abc1234) → AppError를 throw해야 한다', () => {
      expect(() => validatePassword('abc1234')).toThrow(AppError);
    });

    test('숫자만 8자(12345678) → AppError를 throw해야 한다', () => {
      expect(() => validatePassword('12345678')).toThrow(AppError);
    });

    test('영문만 8자(abcdefgh) → AppError를 throw해야 한다', () => {
      expect(() => validatePassword('abcdefgh')).toThrow(AppError);
    });

    test('빈 문자열("") → AppError를 throw해야 한다', () => {
      expect(() => validatePassword('')).toThrow(AppError);
    });

    test('null → AppError를 throw해야 한다', () => {
      expect(() => validatePassword(null)).toThrow(AppError);
    });

    test('공백 포함 8자("abc 1234") → AppError를 throw해야 한다', () => {
      expect(() => validatePassword('abc 1234')).toThrow(AppError);
    });

    test('특수문자만(!!!!!!!!!) → AppError를 throw해야 한다', () => {
      expect(() => validatePassword('!!!!!!!!!')).toThrow(AppError);
    });
  });
});
