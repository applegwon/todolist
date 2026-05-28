const AppError = require('../utils/errors');
const httpStatus = require('../constants/httpStatus');
const errorCodes = require('../constants/errorCodes');
const { verifyToken } = require('../lib/jwt');
const { log } = require('../utils/logger');

function authMiddleware(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    log('warn', '인증 헤더 없음 또는 형식 오류', { path: req.path, method: req.method });
    throw new AppError('인증이 필요합니다', httpStatus.UNAUTHORIZED, errorCodes.AUTH_REQUIRED);
  }

  const token = authorization.slice(7);
  const decoded = verifyToken(token);

  req.user = { id: decoded.id, email: decoded.email };
  next();
}

module.exports = authMiddleware;
