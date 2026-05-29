const userService = require('../services/userService');
const AppError = require('../utils/errors');
const errorCodes = require('../constants/errorCodes');
const { validatePassword } = require('../utils/validators');
const { log } = require('../utils/logger');

const VALID_THEMES = ['light', 'dark'];
const VALID_LANGUAGES = ['ko', 'en', 'ja'];

async function getMe(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.id);
    log('info', 'GET /users/me 요청 처리 완료', { userId: req.user.id });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, password, theme, language } = req.body;

    if (password !== undefined) {
      validatePassword(password);
    }

    if (theme !== undefined && !VALID_THEMES.includes(theme)) {
      throw new AppError('theme은 light 또는 dark여야 합니다', 400, errorCodes.INVALID_FORMAT);
    }

    if (language !== undefined && !VALID_LANGUAGES.includes(language)) {
      throw new AppError('language는 ko, en 또는 ja이어야 합니다', 400, errorCodes.INVALID_FORMAT);
    }

    const user = await userService.updateUser(req.user.id, { name, password, theme, language });
    log('info', 'PATCH /users/me 요청 처리 완료', { userId: req.user.id });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };
