'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const request = require('supertest');

const authMiddleware = require(path.join(__dirname, '../../src/middleware/authMiddleware'));
const { signToken } = require(path.join(__dirname, '../../src/lib/jwt'));
const AppError = require(path.join(__dirname, '../../src/utils/errors'));
const errorCodes = require(path.join(__dirname, '../../src/constants/errorCodes'));

// ────────────────────────────────────────────────────────────────
// 통합 테스트용 보호 라우트 등록 (모듈 로드 시점에 app에 주입)
// ────────────────────────────────────────────────────────────────
const app = require(path.join(__dirname, '../../src/app'));

app.get('/test/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ────────────────────────────────────────────────────────────────
// 헬퍼
// ────────────────────────────────────────────────────────────────

/**
 * authorization 헤더를 가진 mock req 객체를 반환한다.
 * @param {string|undefined} authHeader
 */
function makeReq(authHeader) {
  return {
    headers: { authorization: authHeader },
    path: '/test',
    method: 'GET',
  };
}

/**
 * jest.fn()으로 만든 next 콜백을 반환한다.
 */
function makeNext() {
  return jest.fn();
}

/**
 * 동기 throw를 사용하는 미들웨어를 안전하게 실행한다.
 * throw된 에러를 next로 전달한다.
 */
function callMiddleware(req, res, next) {
  try {
    authMiddleware(req, res, next);
  } catch (err) {
    next(err);
  }
}

// ────────────────────────────────────────────────────────────────
// authMiddleware 단위 테스트
// ────────────────────────────────────────────────────────────────
describe('authMiddleware', () => {
  const VALID_PAYLOAD = { id: 1, email: 'test@example.com' };

  // ─────────────────────────────────────────────────────────────
  // 인증 실패 케이스
  // ─────────────────────────────────────────────────────────────
  describe('인증 실패 — next에 AppError(401) 전달', () => {
    test('1. Authorization 헤더 없음 → next에 AppError(401) 전달', () => {
      const req = makeReq(undefined);
      const next = makeNext();

      callMiddleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe(errorCodes.AUTH_REQUIRED);
    });

    test('2. Authorization 헤더 형식 오류 (Bearer 아닌 스킴) → next에 AppError(401) 전달', () => {
      const req = makeReq('Token abc123');
      const next = makeNext();

      callMiddleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.status).toBe(401);
      expect(err.code).toBe(errorCodes.AUTH_REQUIRED);
    });

    test('3. Bearer 뒤 토큰 없음 (Authorization: "Bearer ") → next에 AppError(401) 전달', () => {
      const req = makeReq('Bearer ');
      const next = makeNext();

      callMiddleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.status).toBe(401);
      expect(err.code).toBe(errorCodes.AUTH_REQUIRED);
    });

    test('4. 위변조된 토큰 (signature 조작) → next에 AppError(401) 전달', () => {
      const token = signToken(VALID_PAYLOAD);
      const [header, payload] = token.split('.');
      const tamperedToken = `${header}.${payload}.invalidsignatureXXXX`;

      const req = makeReq(`Bearer ${tamperedToken}`);
      const next = makeNext();

      callMiddleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.status).toBe(401);
      expect(err.code).toBe(errorCodes.AUTH_REQUIRED);
    });

    test('5. 만료된 토큰 → next에 AppError(401) 전달', async () => {
      const expiredToken = signToken(VALID_PAYLOAD, { expiresIn: '1ms' });
      await new Promise((resolve) => setTimeout(resolve, 5));

      const req = makeReq(`Bearer ${expiredToken}`);
      const next = makeNext();

      callMiddleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.status).toBe(401);
      expect(err.code).toBe(errorCodes.AUTH_REQUIRED);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 인증 성공 케이스
  // ─────────────────────────────────────────────────────────────
  describe('인증 성공', () => {
    test('6. 유효한 토큰 → req.user 주입 후 next() 호출 (에러 없음)', () => {
      const token = signToken(VALID_PAYLOAD);
      const req = makeReq(`Bearer ${token}`);
      const next = makeNext();

      callMiddleware(req, {}, next);

      // next가 에러 없이 호출되어야 한다
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(/* 인자 없음 */);

      // req.user에 id, email이 주입되어야 한다
      expect(req.user).toEqual(
        expect.objectContaining({
          id: VALID_PAYLOAD.id,
          email: VALID_PAYLOAD.email,
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 통합 테스트 (supertest + Express errorHandler)
  // ─────────────────────────────────────────────────────────────
  describe('통합 테스트 — 보호 라우트 /test/protected', () => {
    test('7. 인증 헤더 없이 보호된 라우트 접근 → 401 반환', async () => {
      const res = await request(app).get('/test/protected');

      expect(res.status).toBe(401);
    });

    test('8. 유효한 Bearer 토큰으로 보호된 라우트 접근 → 200 반환', async () => {
      const token = signToken(VALID_PAYLOAD);
      const res = await request(app)
        .get('/test/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        id: VALID_PAYLOAD.id,
        email: VALID_PAYLOAD.email,
      });
    });
  });
});
