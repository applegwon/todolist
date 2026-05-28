'use strict';

const request = require('supertest');
const bcryptjs = require('bcryptjs');
const app = require('../../src/app');
const db = require('../../src/db/db');

const TEST_EMAIL_PREFIX = 'test_auth_';
const SIGNUP_EMAIL = 'test_auth_signup@example.com';
const LOGIN_EMAIL = 'test_auth_login@example.com';
const VALID_PASSWORD = 'Password1';

async function cleanupTestUsers() {
  await db.query(`DELETE FROM users WHERE email LIKE '${TEST_EMAIL_PREFIX}%'`);
}

beforeEach(async () => {
  await cleanupTestUsers();
});

afterAll(async () => {
  await cleanupTestUsers();
  await (db.end ? db.end() : Promise.resolve());
});

// ---------------------------------------------------------------------------
describe('POST /api/auth/signup', () => {
  // 1. 정상 회원가입
  it('정상 회원가입 → 201, { id, email, name } 반환 (password 없어야 함)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '테스트유저', email: SIGNUP_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', SIGNUP_EMAIL);
    expect(res.body).toHaveProperty('name', '테스트유저');
    expect(res.body).not.toHaveProperty('password');
  });

  // 2. name 누락
  it('name 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: SIGNUP_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(400);
  });

  // 3. email 누락
  it('email 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '테스트유저', password: VALID_PASSWORD });

    expect(res.status).toBe(400);
  });

  // 4. password 누락
  it('password 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '테스트유저', email: SIGNUP_EMAIL });

    expect(res.status).toBe(400);
  });

  // 5. 잘못된 이메일 형식
  it('잘못된 이메일 형식 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '테스트유저', email: 'not-an-email', password: VALID_PASSWORD });

    expect(res.status).toBe(400);
  });

  // 6. 약한 비밀번호 (8자 미만)
  it('약한 비밀번호 (8자 미만) → 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '테스트유저', email: SIGNUP_EMAIL, password: 'Ab1' });

    expect(res.status).toBe(400);
  });

  // 7. 이메일 중복
  it('이메일 중복 → 409, code: "EMAIL_DUPLICATE"', async () => {
    // 먼저 가입
    await request(app)
      .post('/api/auth/signup')
      .send({ name: '테스트유저', email: SIGNUP_EMAIL, password: VALID_PASSWORD });

    // 동일 이메일로 재가입
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '다른이름', email: SIGNUP_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('code', 'EMAIL_DUPLICATE');
  });
});

// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
  // 로그인 테스트용 계정을 각 테스트 전에 생성
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: '로그인테스트', email: LOGIN_EMAIL, password: VALID_PASSWORD });
  });

  // 1. 정상 로그인
  it('정상 로그인 → 200, token(string)과 user(id, email, name, theme, language) 반환', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: LOGIN_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email', LOGIN_EMAIL);
    expect(res.body.user).toHaveProperty('name', '로그인테스트');
    expect(res.body.user).toHaveProperty('theme');
    expect(res.body.user).toHaveProperty('language');
  });

  // 2. 존재하지 않는 이메일
  it('존재하지 않는 이메일 → 401, code: "INVALID_CREDENTIALS"', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_nonexistent@example.com', password: VALID_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });

  // 3. 비밀번호 불일치
  it('비밀번호 불일치 → 401, code: "INVALID_CREDENTIALS"', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: LOGIN_EMAIL, password: 'WrongPass9' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });

  // 4. email 누락
  it('email 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: VALID_PASSWORD });

    expect(res.status).toBe(400);
  });

  // 5. password 누락
  it('password 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: LOGIN_EMAIL });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
describe('비밀번호 보안 검증 (NFR-201)', () => {
  const HASH_TEST_EMAIL = 'test_auth_hashcheck@example.com';

  // 1. DB에 저장된 비밀번호가 해시이고 원문과 다르다
  it('DB에 저장된 비밀번호가 bcrypt 해시이고 원문과 다르다', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: '해시검증', email: HASH_TEST_EMAIL, password: VALID_PASSWORD });

    const result = await db.query('SELECT password FROM users WHERE email = $1', [HASH_TEST_EMAIL]);
    expect(result.rows.length).toBe(1);

    const storedHash = result.rows[0].password;

    // 저장값이 원문과 달라야 한다
    expect(storedHash).not.toBe(VALID_PASSWORD);

    // bcrypt 해시임을 검증 ($2b$ 또는 $2a$ 접두사)
    expect(storedHash).toMatch(/^\$2[ab]\$/);

    // bcryptjs.compare로 원문과 매칭 확인
    const isMatch = await bcryptjs.compare(VALID_PASSWORD, storedHash);
    expect(isMatch).toBe(true);
  });
});
