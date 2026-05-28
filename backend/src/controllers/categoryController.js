const categoryService = require('../services/categoryService');
const AppError = require('../utils/errors');
const { MISSING_FIELD } = require('../constants/errorCodes');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategoriesByUser(req.user.id);
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      throw new AppError('카테고리 이름은 필수입니다', 400, MISSING_FIELD);
    }
    const category = await categoryService.createCategory(req.user.id, name);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const categoryId = parseInt(req.params.id, 10);
    const { name } = req.body;
    if (!name) {
      throw new AppError('카테고리 이름은 필수입니다', 400, MISSING_FIELD);
    }
    const category = await categoryService.updateCategory(req.user.id, categoryId, name);
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const categoryId = parseInt(req.params.id, 10);
    await categoryService.deleteCategory(req.user.id, categoryId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
