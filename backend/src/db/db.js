require('dotenv').config();

const { Pool } = require('pg');

// DB 연결 관련 로깅 함수
function logDbError(err) {
  console.error('[DB 연결 오류]', err.message);
}

// DATABASE_URL 환경변수로 커넥션 풀 초기화
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 커넥션 풀 수준의 오류 감지 (idle 클라이언트 오류 등)
pool.on('error', (err) => {
  logDbError(err);
});

/**
 * SQL 쿼리 실행
 * @param {string} text     - SQL 쿼리 문자열
 * @param {Array}  params   - 바인딩 파라미터 배열
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { query };
