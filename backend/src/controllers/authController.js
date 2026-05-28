const authService = require('../services/authService');
const AppError = require('../utils/errors');
const { validateEmail, validatePassword } = require('../utils/validators');
const httpStatus = require('../constants/httpStatus');
const errorCodes = require('../constants/errorCodes');

async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError(
        '이메일, 비밀번호, 이름은 필수 항목입니다',
        httpStatus.BAD_REQUEST,
        errorCodes.MISSING_FIELD,
      );
    }

    validateEmail(email);
    validatePassword(password);

    const user = await authService.signup(email, password, name);

    return res.status(httpStatus.CREATED).json(user);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        '이메일과 비밀번호는 필수 항목입니다',
        httpStatus.BAD_REQUEST,
        errorCodes.MISSING_FIELD,
      );
    }

    const { token, user } = await authService.login(email, password);

    return res.status(httpStatus.OK).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, login };
