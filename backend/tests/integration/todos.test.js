'use strict';

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db/db');

const USER1_EMAIL = 'test_todo_user1@example.com';
const USER2_EMAIL = 'test_todo_user2@example.com';
const VALID_PASSWORD = 'Password1';

let user1Token;
let user2Token;

function authHeader(t) {
  return { Authorization: `Bearer ${t}` };
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

async function cleanupTodos() {
  await db.query(
    `DELETE FROM todos WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_todo_%')`
  );
}

async function cleanupAll() {
  await cleanupTodos();
  await db.query(
    `DELETE FROM categories WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_todo_%')`
  );
  await db.query(`DELETE FROM users WHERE email LIKE 'test_todo_%'`);
}

beforeAll(async () => {
  await cleanupAll();

  await request(app)
    .post('/api/auth/signup')
    .send({ name: '할일테스트유저1', email: USER1_EMAIL, password: VALID_PASSWORD });

  await request(app)
    .post('/api/auth/signup')
    .send({ name: '할일테스트유저2', email: USER2_EMAIL, password: VALID_PASSWORD });
});

beforeEach(async () => {
  await cleanupTodos();

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
  await cleanupAll();
  await (db.end ? db.end() : Promise.resolve());
});

// ---------------------------------------------------------------------------
describe('GET /api/todos', () => {
  // 1. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
  });

  // 2. 빈 목록 조회 → 200, 빈 배열
  it('빈 목록 조회 → 200, 빈 배열', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set(authHeader(user1Token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  // 3. 할일 생성 후 목록 조회 → 200, is_overdue 필드 포함
  it('할일 생성 후 목록 조회 → 200, is_overdue 필드 포함', async () => {
    await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '조회테스트 할일' });

    const res = await request(app)
      .get('/api/todos')
      .set(authHeader(user1Token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('is_overdue');
  });

  // 4. category 필터 → 해당 카테고리 항목만 반환
  it('category 필터 → 해당 카테고리 항목만 반환', async () => {
    // 카테고리 생성
    const catRes = await request(app)
      .post('/api/categories')
      .set(authHeader(user1Token))
      .send({ name: '필터테스트카테고리' });
    const categoryId = catRes.body.id;

    // 기본 카테고리 할일
    await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '기본카테고리 할일' });

    // 특정 카테고리 할일
    await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '특정카테고리 할일', category_id: categoryId });

    const res = await request(app)
      .get(`/api/todos?category=${categoryId}`)
      .set(authHeader(user1Token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((todo) => {
      expect(todo.category_id).toBe(categoryId);
    });
  });

  // 5. status 필터 (진행중) → 해당 상태 항목만 반환
  it('status 필터 (진행중) → 해당 상태 항목만 반환', async () => {
    // 미시작 할일
    await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '미시작 할일' });

    // 진행중 할일 생성 후 상태 변경
    const createRes = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '진행중 할일' });

    const todoId = createRes.body.id;

    await request(app)
      .patch(`/api/todos/${todoId}`)
      .set(authHeader(user1Token))
      .send({ status: '진행중' });

    const res = await request(app)
      .get('/api/todos?status=진행중')
      .set(authHeader(user1Token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((todo) => {
      expect(todo.status).toBe('진행중');
    });
  });

  // 6. overdue=true 필터 → 기한초과 항목만 반환
  it('overdue=true 필터 → 기한초과 항목만 반환 (end_date를 과거 날짜로 설정)', async () => {
    // 기한초과 할일 (end_date=어제, status=미시작)
    await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '기한초과 할일', end_date: yesterday() });

    // 기한 미초과 할일
    await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '기한내 할일', end_date: tomorrow() });

    const res = await request(app)
      .get('/api/todos?overdue=true')
      .set(authHeader(user1Token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((todo) => {
      expect(todo.is_overdue).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
describe('POST /api/todos', () => {
  // 7. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: '인증없는 할일' });

    expect(res.status).toBe(401);
  });

  // 8. 정상 생성 (title만) → 201, category_id = 1 (기본)
  it('정상 생성 (title만) → 201, category_id = 1 (기본)', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: 'title만 있는 할일' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', 'title만 있는 할일');
    expect(res.body).toHaveProperty('category_id', 1);
    expect(res.body).toHaveProperty('is_overdue');
  });

  // 9. 정상 생성 (전체 필드) → 201, 모든 필드 포함
  it('정상 생성 (전체 필드) → 201, 모든 필드 포함', async () => {
    const startDate = tomorrow();
    const endDate = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    })();

    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({
        title: '전체필드 할일',
        description: '설명입니다',
        category_id: 1,
        start_date: startDate,
        end_date: endDate,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', '전체필드 할일');
    expect(res.body).toHaveProperty('description', '설명입니다');
    expect(res.body).toHaveProperty('category_id', 1);
    expect(res.body).toHaveProperty('start_date');
    expect(res.body).toHaveProperty('end_date');
    expect(res.body).toHaveProperty('is_overdue');
  });

  // 10. title 누락 → 400
  it('title 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ description: '제목없는 할일' });

    expect(res.status).toBe(400);
  });

  // 11. end_date < start_date → 400, code: "INVALID_DATE_RANGE"
  it('end_date < start_date → 400, code: "INVALID_DATE_RANGE"', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({
        title: '날짜오류 할일',
        start_date: tomorrow(),
        end_date: yesterday(),
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code', 'INVALID_DATE_RANGE');
  });

  // 12. category_id 미지정 → category_id = 1
  it('category_id 미지정 → category_id = 1', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '카테고리 미지정 할일' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('category_id', 1);
  });
});

// ---------------------------------------------------------------------------
describe('PATCH /api/todos/:id', () => {
  // 13. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app)
      .patch('/api/todos/999')
      .send({ status: '완료' });

    expect(res.status).toBe(401);
  });

  // 14. status 변경 (완료) → 200, status: '완료' 반환
  it('status 변경 (완료) → 200, status: "완료" 반환', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '상태변경 할일' });

    const todoId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .set(authHeader(user1Token))
      .send({ status: '완료' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', todoId);
    expect(res.body).toHaveProperty('status', '완료');
  });

  // 15. 타인 소유 수정 → 403
  it('타인 소유 수정 시도 → 403', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: 'user1 소유 할일' });

    const todoId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .set(authHeader(user2Token))
      .send({ status: '완료' });

    expect(res.status).toBe(403);
  });

  // 16. end_date < start_date → 400
  it('end_date < start_date → 400', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '날짜수정 할일' });

    const todoId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .set(authHeader(user1Token))
      .send({
        start_date: tomorrow(),
        end_date: yesterday(),
      });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
describe('DELETE /api/todos/:id', () => {
  // 17. 인증 없음 → 401
  it('인증 없음 → 401', async () => {
    const res = await request(app).delete('/api/todos/999');
    expect(res.status).toBe(401);
  });

  // 18. 정상 삭제 → 204
  it('정상 삭제 → 204', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: '삭제할 할일' });

    const todoId = createRes.body.id;

    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set(authHeader(user1Token));

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  // 19. 타인 소유 삭제 → 403
  it('타인 소유 삭제 시도 → 403', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .set(authHeader(user1Token))
      .send({ title: 'user1 소유 삭제대상 할일' });

    const todoId = createRes.body.id;

    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set(authHeader(user2Token));

    expect(res.status).toBe(403);
  });

  // 20. 존재하지 않는 id → 404
  it('존재하지 않는 id → 404', async () => {
    const res = await request(app)
      .delete('/api/todos/999999999')
      .set(authHeader(user1Token));

    expect(res.status).toBe(404);
  });
});
