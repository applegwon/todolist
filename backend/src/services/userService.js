const { query } = require('../db/db');
const AppError = require('../utils/errors');
const errorCodes = require('../constants/errorCodes');
const { hashPassword } = require('../lib/passwordUtils');
const { log } = require('../utils/logger');

async function getUserById(id) {
  const result = await query(
    'SELECT id, email, name, theme, language, created_at FROM users WHERE id = $1',
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError('사용자를 찾을 수 없습니다', 404, errorCodes.NOT_FOUND);
  }

  const user = result.rows[0];
  log('info', '사용자 조회 완료', { userId: id });
  return user;
}

async function updateUser(id, updates) {
  const { name, password, theme, language } = updates;

  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }

  if (password !== undefined) {
    const hashed = await hashPassword(password);
    fields.push(`password = $${idx++}`);
    values.push(hashed);
  }

  if (theme !== undefined) {
    fields.push(`theme = $${idx++}`);
    values.push(theme);
  }

  if (language !== undefined) {
    fields.push(`language = $${idx++}`);
    values.push(language);
  }

  if (fields.length === 0) {
    throw new AppError('수정할 항목이 없습니다', 400, errorCodes.MISSING_FIELD);
  }

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, email, name, theme, language, created_at`;

  const result = await query(sql, values);
  const user = result.rows[0];
  log('info', '사용자 정보 수정 완료', { userId: id });
  return user;
}

module.exports = { getUserById, updateUser };
