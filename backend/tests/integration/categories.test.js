'use strict';

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db/db');

const USER1_EMAIL = 'test_cat_user1@example.com';
const USER2_EMAIL = 'test_cat_user2@example.com';
const VALID_PASSWORD = 'Password1';

let user1Token;
let user2Token;

function authHeader(t) {
  return { Authorization: `Bearer ${t}` };
}

async function cleanupTestCatData() {
  await db.query(
    `DELETE FROM todos WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_cat_%')`
  );
  await db.query(
    `DELETE FROM categories WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_cat_%')`
  );
  await db.query(`DELETE FROM users WHERE email LIKE 'test_cat_%'`);
}

async function cleanupTestCatCategories() {
  await db.query(
    `DELETE FROM todos WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_cat_%')`
  );
  await db.query(
    `DELETE FROM categories WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_cat_%')`
  );
}

beforeAll(async () => {
  // 이전 테스트 잔여 데이터 정리 후 user1, user2 회원가입
  await cleanupTestCatData();

  await request(app)
    .post('/api/auth/signup')
    .send({ name: '카테고리테스트유저1', email: USER1_EMAIL, password: VALID_PASSWORD });

  await request(app)
    .post('/api/auth/signup')
    .send({ name: '카테고리테스트유저2', email: USER2_EMAIL, password: VALID_PASSWORD });
});

beforeEach(async () => {
  // 각 테스트 전 카테고리 정리 (기본 카테고리 id=1 제외)
  await cleanupTestCatCategories();

  // user1, user2 로그인하여 토큰 갱신
  const res1 = await request(app)
    .post('/api/auth/login')
    .send({ email: USER1_EMAIL, password: VALID_PASSWORD });
  user1Token = res1.body.token;

  const res2 = await request(app)
    .post('/api/auth/login')
    .send({ email: USER2_EMAIL, password: VALID_PASSWORD });
  user2Token = res2.body.token;
});

afterAll(async () => {
  await cleanupTestCatData();
  await (db.end ? db.end() : Promise.resolve());
});

// ---------------------------------------------------------------------------
describe('GET /api/categories', () => {
  // 1. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });

  // 2. 유효한 토큰으로 조회 → 200, 배열 반환
  it('유효한 토큰으로 조회 → 200, 배열 반환', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set(authHeader(user1Token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 3. 기본 카테고리(user_id=null인 항목)가 목록에 포함된다
  it('기본 카테고리(user_id=null인 항목)가 목록에 포함된다', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set(authHeader(user1Token));

    expect(res.status).toBe(200);
    const hasDefaultCategory = res.body.some((cat) => cat.user_id === null);
    expect(hasDefaultCategory).toBe(true);
  });
});

// ---------------------------------------------------------------------------
describe('POST /api/categories', () => {
  // 4. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: '새카테고리' });

    expect(res.status).toBe(401);
  });

  // 5. 정상 생성 → 201, { id, name, user_id } 반환
  it('정상 생성 → 201, { id, name, user_id } 반환', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '새카테고리' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', '새카테고리');
    expect(res.body).toHaveProperty('user_id');
    expect(res.body.user_id).not.toBeNull();
  });

  // 6. name 누락 → 400
  it('name 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({});

    expect(res.status).toBe(400);
  });

  // 7. 이름 중복 → 409, code: "CATEGORY_NAME_DUPLICATE"
  it('이름 중복 → 409, code: "CATEGORY_NAME_DUPLICATE"', async () => {
    await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '중복카테고리' });

    const res = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '중복카테고리' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('code', 'CATEGORY_NAME_DUPLICATE');
  });
});

// ---------------------------------------------------------------------------
describe('PATCH /api/categories/:id', () => {
  // 8. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app)
      .patch('/api/categories/999')
      .send({ name: '변경시도' });

    expect(res.status).toBe(401);
  });

  // 9. 정상 수정 → 200, 변경된 name 반환
  it('정상 수정 → 200, 변경된 name 반환', async () => {
    const createRes = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '수정전카테고리' });

    const catId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/categories/${catId}`)
      .set(authHeader(user1Token))
      .send({ name: '수정후카테고리' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', catId);
    expect(res.body).toHaveProperty('name', '수정후카테고리');
    expect(res.body).toHaveProperty('user_id');
  });

  // 10. name 누락 → 400
  it('name 누락 → 400', async () => {
    const createRes = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '이름누락테스트' });

    const catId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/categories/${catId}`)
      .set(authHeader(user1Token))
      .send({});

    expect(res.status).toBe(400);
  });

  // 11. 기본 카테고리(id=1) 수정 → 403
  it('기본 카테고리(id=1) 수정 → 403', async () => {
    const res = await request(app)
      .patch('/api/categories/1')
      .set(authHeader(user1Token))
      .send({ name: '기본카테고리수정시도' });

    expect(res.status).toBe(403);
  });

  // 12. 타인 소유 카테고리 수정 → 403
  it('타인 소유 카테고리 수정 → 403', async () => {
    // user1으로 카테고리 생성
    const createRes = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '유저1카테고리' });

    const catId = createRes.body.id;

    // user2로 수정 시도 → 403
    const res = await request(app)
      .patch(`/api/categories/${catId}`)
      .set(authHeader(user2Token))
      .send({ name: '변경시도' });

    expect(res.status).toBe(403);
  });

  // 13. 이름 중복 → 409
  it('이름 중복 → 409', async () => {
    await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '기존카테고리' });

    const createRes = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '수정대상카테고리' });

    const catId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/categories/${catId}`)
      .set(authHeader(user1Token))
      .send({ name: '기존카테고리' });

    expect(res.status).toBe(409);
  });
});

// ---------------------------------------------------------------------------
describe('DELETE /api/categories/:id', () => {
  // 14. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app).delete('/api/categories/999');
    expect(res.status).toBe(401);
  });

  // 15. 정상 삭제 → 204
  it('정상 삭제 → 204', async () => {
    const createRes = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '삭제할카테고리' });

    const catId = createRes.body.id;

    const res = await request(app)
      .delete(`/api/categories/${catId}`)
      .set(authHeader(user1Token));

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  // 16. 기본 카테고리(id=1) 삭제 → 403
  it('기본 카테고리(id=1) 삭제 → 403', async () => {
    const res = await request(app)
      .delete('/api/categories/1')
      .set(authHeader(user1Token));

    expect(res.status).toBe(403);
  });

  // 17. 타인 소유 카테고리 삭제 → 403
  it('타인 소유 카테고리 삭제 → 403', async () => {
    // user1으로 카테고리 생성
    const createRes = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '유저1삭제대상' });

    const catId = createRes.body.id;

    // user2로 삭제 시도 → 403
    const res = await request(app)
      .delete(`/api/categories/${catId}`)
      .set(authHeader(user2Token));

    expect(res.status).toBe(403);
  });
});
