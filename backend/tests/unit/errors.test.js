'use strict';

const path = require('path');

const AppError = require(path.join(__dirname, '../../src/utils/errors'));

// ────────────────────────────────────────────────────────────────
// AppError 클래스 단위 테스트
// 대상: src/utils/errors.js
// ────────────────────────────────────────────────────────────────
describe('AppError 클래스', () => {
  const MESSAGE = '테스트 오류 메시지';
  const STATUS = 400;
  const CODE = 'TEST_ERROR';

  let error;

  beforeEach(() => {
    error = new AppError(MESSAGE, STATUS, CODE);
  });

  // ────────────────────────────────────────────────────────────────
  // 1. 상속 검증
  // ────────────────────────────────────────────────────────────────
  describe('Error 상속', () => {
    test('AppError 인스턴스는 Error를 상속해야 한다', () => {
      expect(error).toBeInstanceOf(Error);
    });

    test('AppError 인스턴스는 AppError의 인스턴스여야 한다', () => {
      expect(error).toBeInstanceOf(AppError);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 2. 프로퍼티 저장 검증
  // ────────────────────────────────────────────────────────────────
  describe('프로퍼티 저장', () => {
    test('message가 올바르게 저장되어야 한다', () => {
      expect(error.message).toBe(MESSAGE);
    });

    test('status가 올바르게 저장되어야 한다', () => {
      expect(error.status).toBe(STATUS);
    });

    test('code가 올바르게 저장되어야 한다', () => {
      expect(error.code).toBe(CODE);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 3. isOperational 플래그 검증
  // ────────────────────────────────────────────────────────────────
  describe('isOperational 플래그', () => {
    test('isOperational은 true여야 한다', () => {
      expect(error.isOperational).toBe(true);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 4. stack trace 검증
  // ────────────────────────────────────────────────────────────────
  describe('stack trace', () => {
    test('stack trace가 존재해야 한다', () => {
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack.length).toBeGreaterThan(0);
    });

    test('stack trace에 오류 메시지가 포함되어야 한다', () => {
      expect(error.stack).toContain(MESSAGE);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 5. 다양한 status/code 조합 검증
  // ────────────────────────────────────────────────────────────────
  describe('다양한 인자 조합', () => {
    test('404 상태와 NOT_FOUND 코드로 생성할 수 있어야 한다', () => {
      const notFound = new AppError('리소스를 찾을 수 없습니다', 404, 'NOT_FOUND');
      expect(notFound.status).toBe(404);
      expect(notFound.code).toBe('NOT_FOUND');
      expect(notFound.isOperational).toBe(true);
    });

    test('500 상태와 INTERNAL_ERROR 코드로 생성할 수 있어야 한다', () => {
      const serverError = new AppError('서버 내부 오류', 500, 'INTERNAL_ERROR');
      expect(serverError.status).toBe(500);
      expect(serverError.code).toBe('INTERNAL_ERROR');
      expect(serverError.isOperational).toBe(true);
    });

    test('401 상태와 UNAUTHORIZED 코드로 생성할 수 있어야 한다', () => {
      const unauthorized = new AppError('인증이 필요합니다', 401, 'UNAUTHORIZED');
      expect(unauthorized.status).toBe(401);
      expect(unauthorized.code).toBe('UNAUTHORIZED');
    });
  });
});
