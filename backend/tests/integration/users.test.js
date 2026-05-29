'use strict';

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db/db');

const TEST_EMAIL = 'test_users_me@example.com';
const TEST_PASSWORD = 'Password1';
const TEST_NAME = '테스트유저';

let token;

function authHeader(t) {
  return { Authorization: `Bearer ${t}` };
}

beforeAll(async () => {
  await db.query(`DELETE FROM users WHERE email LIKE 'test_users_%'`);
  await request(app)
    .post('/api/auth/signup')
    .send({ name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD });
});

beforeEach(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
  token = res.body.token;
});

afterAll(async () => {
  await db.query(`DELETE FROM users WHERE email LIKE 'test_users_%'`);
  await (db.end ? db.end() : Promise.resolve());
});

// ---------------------------------------------------------------------------
describe('GET /api/users/me', () => {
  // 1. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  // 2. 유효한 토큰으로 조회 → 200, user 필드 포함
  it('유효한 토큰으로 조회 → 200, user 필드(id, email, name, theme, language, created_at) 포함', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', TEST_EMAIL);
    expect(res.body).toHaveProperty('name', TEST_NAME);
    expect(res.body).toHaveProperty('theme');
    expect(res.body).toHaveProperty('language');
    expect(res.body).toHaveProperty('created_at');
  });

  // 3. 응답에 password 필드가 없다
  it('응답에 password 필드가 없다', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('password');
  });
});

// ---------------------------------------------------------------------------
describe('PATCH /api/users/me', () => {
  // 4. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .send({ name: '새이름' });

    expect(res.status).toBe(401);
  });

  // 5. 이름 변경 → 200, name이 변경된 사용자 정보 반환
  it('이름 변경 → 200, name이 변경된 사용자 정보 반환', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ name: '변경된이름' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', '변경된이름');
    expect(res.body).toHaveProperty('email', TEST_EMAIL);
    expect(res.body).toHaveProperty('id');
  });

  // 6. theme 변경 (dark) → 200, theme: 'dark' 반환
  it("theme 변경 (dark) → 200, theme: 'dark' 반환", async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ theme: 'dark' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('theme', 'dark');
  });

  // 7. language 변경 (en) → 200, language: 'en' 반환
  it("language 변경 (en) → 200, language: 'en' 반환", async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ language: 'en' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('language', 'en');
  });

  // 8. 비밀번호 변경 → 200, 이후 새 비밀번호로 로그인 성공
  it('비밀번호 변경 → 200, 이후 새 비밀번호로 로그인 성공', async () => {
    const NEW_PASSWORD = 'NewPassword2';

    const patchRes = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ password: NEW_PASSWORD });

    expect(patchRes.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: NEW_PASSWORD });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');

    // 이후 테스트를 위해 원래 비밀번호로 복원
    const restoreToken = loginRes.body.token;
    await request(app)
      .patch('/api/users/me')
      .set({ Authorization: `Bearer ${restoreToken}` })
      .send({ password: TEST_PASSWORD });
  });

  // 9. 빈 body → 400
  it('빈 body → 400', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({});

    expect(res.status).toBe(400);
  });

  // 10. 유효하지 않은 theme ('blue') → 400
  it("유효하지 않은 theme ('blue') → 400", async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ theme: 'blue' });

    expect(res.status).toBe(400);
  });

  // 11. 유효하지 않은 language ('jp') → 400
  it("유효하지 않은 language ('jp') → 400", async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ language: 'jp' });

    expect(res.status).toBe(400);
  });

  // 13. language 변경 (ja) → 200, language: 'ja' 반환
  it("language 변경 (ja) → 200, language: 'ja' 반환", async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ language: 'ja' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('language', 'ja');
  });

  // 14. language ja 저장 후 GET /me 에서 ja 반환
  it("language ja 저장 후 GET /me 에서 ja 반환", async () => {
    await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ language: 'ja' });

    const res = await request(app)
      .get('/api/users/me')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('language', 'ja');
  });

  // 12. 약한 비밀번호 (8자 미만) → 400
  it('약한 비밀번호 (8자 미만) → 400', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ password: 'Ab1' });

    expect(res.status).toBe(400);
  });
});
