'use strict';

const path = require('path');

const { hashPassword, comparePassword } = require(path.join(__dirname, '../../src/lib/passwordUtils'));

// ────────────────────────────────────────────────────────────────
// passwordUtils 단위 테스트
// 대상: src/lib/passwordUtils.js
// ────────────────────────────────────────────────────────────────
describe('passwordUtils', () => {
  const PLAIN_PASSWORD = 'abc12345';
  const WRONG_PASSWORD = 'wrongPass99';

  // ────────────────────────────────────────────────────────────────
  // 1. hashPassword
  // ────────────────────────────────────────────────────────────────
  describe('hashPassword', () => {
    test('반환값이 문자열이어야 한다', async () => {
      const hash = await hashPassword(PLAIN_PASSWORD);
      expect(typeof hash).toBe('string');
    });

    test('해시가 원문과 달라야 한다', async () => {
      const hash = await hashPassword(PLAIN_PASSWORD);
      expect(hash).not.toBe(PLAIN_PASSWORD);
    });

    test('같은 원문이라도 호출마다 다른 해시를 반환해야 한다 (salt)', async () => {
      const hash1 = await hashPassword(PLAIN_PASSWORD);
      const hash2 = await hashPassword(PLAIN_PASSWORD);
      expect(hash1).not.toBe(hash2);
    });

    test('해시 결과가 빈 문자열이 아니어야 한다', async () => {
      const hash = await hashPassword(PLAIN_PASSWORD);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('bcrypt 해시 형식($2b$)으로 시작해야 한다', async () => {
      const hash = await hashPassword(PLAIN_PASSWORD);
      expect(hash).toMatch(/^\$2[ab]\$/);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 2. comparePassword
  // ────────────────────────────────────────────────────────────────
  describe('comparePassword', () => {
    let storedHash;

    beforeAll(async () => {
      storedHash = await hashPassword(PLAIN_PASSWORD);
    });

    test('올바른 비밀번호 → true를 반환해야 한다', async () => {
      const result = await comparePassword(PLAIN_PASSWORD, storedHash);
      expect(result).toBe(true);
    });

    test('틀린 비밀번호 → false를 반환해야 한다', async () => {
      const result = await comparePassword(WRONG_PASSWORD, storedHash);
      expect(result).toBe(false);
    });

    test('빈 문자열 비밀번호 → false를 반환해야 한다', async () => {
      const result = await comparePassword('', storedHash);
      expect(result).toBe(false);
    });

    test('대소문자가 다른 비밀번호 → false를 반환해야 한다', async () => {
      const result = await comparePassword('ABC12345', storedHash);
      expect(result).toBe(false);
    });
  });
});
