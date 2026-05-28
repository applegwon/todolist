const httpStatus = require('../constants/httpStatus');
const errorCodes = require('../constants/errorCodes');
const AppError = require('./errors');

// 이메일 형식 검증 (RFC 5322 간략 정규식)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 비밀번호 조건: 8자 이상, 영문 1자 이상, 숫자 1자 이상, 공백 불허
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_LETTER_REGEX = /[a-zA-Z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_NO_SPACE_REGEX = /^\S+$/;

/**
 * 이메일 형식 검증
 * @param {string} email
 * @throws {AppError} 형식이 올바르지 않으면 400 에러
 */
function validateEmail(email) {
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError(
      '올바른 이메일 형식이 아닙니다',
      httpStatus.BAD_REQUEST,
      errorCodes.INVALID_FORMAT,
    );
  }
}

/**
 * 비밀번호 조건 검증 (8자 이상 + 영문 + 숫자 조합)
 * @param {string} password
 * @throws {AppError} 조건 미충족 시 400 에러
 */
function validatePassword(password) {
  if (
    !password ||
    password.length < PASSWORD_MIN_LENGTH ||
    !PASSWORD_LETTER_REGEX.test(password) ||
    !PASSWORD_NUMBER_REGEX.test(password) ||
    !PASSWORD_NO_SPACE_REGEX.test(password)
  ) {
    throw new AppError(
      '비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다',
      httpStatus.BAD_REQUEST,
      errorCodes.INVALID_FORMAT,
    );
  }
}

module.exports = { validateEmail, validatePassword };
