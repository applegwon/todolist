const { query } = require('../db/db');
const AppError = require('../utils/errors');
const { hashPassword, comparePassword } = require('../lib/passwordUtils');
const { signToken } = require('../lib/jwt');
const httpStatus = require('../constants/httpStatus');
const errorCodes = require('../constants/errorCodes');

async function signup(email, password, name) {
  const existing = await query(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );

  if (existing.rows.length > 0) {
    throw new AppError(
      '이미 사용 중인 이메일입니다',
      httpStatus.CONFLICT,
      errorCodes.EMAIL_DUPLICATE,
    );
  }

  const hashedPassword = await hashPassword(password);

  const result = await query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, hashedPassword, name],
  );

  return result.rows[0];
}

async function login(email, password) {
  const result = await query(
    'SELECT id, email, password, name, theme, language FROM users WHERE email = $1',
    [email],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      '이메일 또는 비밀번호가 올바르지 않습니다',
      httpStatus.UNAUTHORIZED,
      errorCodes.INVALID_CREDENTIALS,
    );
  }

  const user = result.rows[0];
  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError(
      '이메일 또는 비밀번호가 올바르지 않습니다',
      httpStatus.UNAUTHORIZED,
      errorCodes.INVALID_CREDENTIALS,
    );
  }

  const token = signToken({ id: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      theme: user.theme,
      language: user.language,
    },
  };
}

module.exports = { signup, login };
