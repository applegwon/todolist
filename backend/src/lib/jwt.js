require('dotenv').config();

const jwt = require('jsonwebtoken');
const AppError = require('../utils/errors');
const httpStatus = require('../constants/httpStatus');
const errorCodes = require('../constants/errorCodes');

/**
 * JWT 토큰 서명 발급
 * @param {object} payload - 토큰에 담을 데이터
 * @returns {string} 서명된 JWT 토큰
 */
function signToken(payload, options = {}) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
    ...options,
  });
}

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 JWT 토큰
 * @returns {object} 디코딩된 페이로드
 * @throws {AppError} 토큰이 유효하지 않거나 만료된 경우 401 에러
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(
      '인증이 필요합니다',
      httpStatus.UNAUTHORIZED,
      errorCodes.AUTH_REQUIRED,
    );
  }
}

module.exports = { signToken, verifyToken };
