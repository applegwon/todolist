'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { signToken, verifyToken } = require(path.join(__dirname, '../../src/lib/jwt'));
const AppError = require(path.join(__dirname, '../../src/utils/errors'));

// ────────────────────────────────────────────────────────────────
// jwt 단위 테스트
// 대상: src/lib/jwt.js
// ────────────────────────────────────────────────────────────────
describe('jwt', () => {
  const PAYLOAD = { userId: 1, email: 'user@example.com' };

  // ────────────────────────────────────────────────────────────────
  // 1. signToken
  // ────────────────────────────────────────────────────────────────
  describe('signToken', () => {
    test('페이로드로 토큰 생성 시 문자열을 반환해야 한다', () => {
      const token = signToken(PAYLOAD);
      expect(typeof token).toBe('string');
    });

    test('생성된 토큰이 비어있지 않아야 한다', () => {
      const token = signToken(PAYLOAD);
      expect(token.length).toBeGreaterThan(0);
    });

    test('생성된 토큰이 3개 파트(header.payload.signature)로 구성되어야 한다', () => {
      const token = signToken(PAYLOAD);
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    test('header 파트가 base64url 형식이어야 한다', () => {
      const token = signToken(PAYLOAD);
      const [header] = token.split('.');
      expect(header).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 2. verifyToken
  // ────────────────────────────────────────────────────────────────
  describe('verifyToken', () => {
    test('유효한 토큰 → 원본 페이로드(userId, email)를 반환해야 한다', () => {
      const token = signToken(PAYLOAD);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(PAYLOAD.userId);
      expect(decoded.email).toBe(PAYLOAD.email);
    });

    test('유효한 토큰 디코딩 결과가 객체여야 한다', () => {
      const token = signToken(PAYLOAD);
      const decoded = verifyToken(token);
      expect(typeof decoded).toBe('object');
      expect(decoded).not.toBeNull();
    });

    test('위변조된 토큰(signature 조작) → AppError를 throw해야 한다', () => {
      const token = signToken(PAYLOAD);
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.invalidSignatureXXX`;
      expect(() => verifyToken(tamperedToken)).toThrow(AppError);
    });

    test('완전히 잘못된 문자열 → AppError를 throw해야 한다', () => {
      expect(() => verifyToken('not.a.valid.jwt.token')).toThrow(AppError);
    });

    test('빈 문자열 → AppError를 throw해야 한다', () => {
      expect(() => verifyToken('')).toThrow(AppError);
    });

    test('만료된 토큰(expiresIn: 1ms) → AppError를 throw해야 한다', async () => {
      const expiredToken = signToken(PAYLOAD, { expiresIn: '1ms' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(() => verifyToken(expiredToken)).toThrow(AppError);
    });
  });
});
