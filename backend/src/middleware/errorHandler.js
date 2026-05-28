const AppError = require('../utils/errors');
const httpStatus = require('../constants/httpStatus');
const errorCodes = require('../constants/errorCodes');

// 서버 내부 오류 로깅 함수
function logServerError(err) {
  console.error('[서버 오류]', err);
}

/**
 * Express 전역 에러 핸들러 미들웨어 (4-인자 시그니처 필수)
 * - AppError(isOperational=true): 원본 status/message/code 그대로 응답
 * - 그 외: 500 내부 서버 오류 응답
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      code: err.code,
    });
  }

  // 예측 불가능한 오류는 로깅 후 500 응답
  logServerError(err);

  return res.status(httpStatus.INTERNAL_ERROR).json({
    status: httpStatus.INTERNAL_ERROR,
    message: '서버 오류가 발생했습니다',
    code: errorCodes.INTERNAL_ERROR,
  });
}

module.exports = errorHandler;
