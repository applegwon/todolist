const db = require('../db/db');
const AppError = require('../utils/errors');
const { NOT_FOUND, FORBIDDEN, CATEGORY_NAME_DUPLICATE } = require('../constants/errorCodes');
const { DEFAULT_CATEGORY_ID } = require('../constants/dbDefaults');

async function getCategoriesByUser(userId) {
  const result = await db.query(
    'SELECT id, name, user_id FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY id ASC',
    [userId]
  );
  return result.rows;
}

async function createCategory(userId, name) {
  const duplicate = await db.query(
    'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
    [userId, name]
  );
  if (duplicate.rows.length > 0) {
    throw new AppError('이미 사용 중인 카테고리 이름입니다', 409, CATEGORY_NAME_DUPLICATE);
  }

  const result = await db.query(
    'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id, name, user_id',
    [userId, name]
  );
  return result.rows[0];
}

async function updateCategory(userId, categoryId, name) {
  const found = await db.query(
    'SELECT id, name, user_id FROM categories WHERE id = $1',
    [categoryId]
  );
  if (found.rows.length === 0) {
    throw new AppError('카테고리를 찾을 수 없습니다', 404, NOT_FOUND);
  }

  const category = found.rows[0];
  if (category.user_id === null) {
    throw new AppError('기본 카테고리는 수정할 수 없습니다', 403, FORBIDDEN);
  }
  if (category.user_id !== userId) {
    throw new AppError('해당 카테고리를 수정할 권한이 없습니다', 403, FORBIDDEN);
  }

  const duplicate = await db.query(
    'SELECT id FROM categories WHERE user_id = $1 AND name = $2 AND id != $3',
    [userId, name, categoryId]
  );
  if (duplicate.rows.length > 0) {
    throw new AppError('이미 사용 중인 카테고리 이름입니다', 409, CATEGORY_NAME_DUPLICATE);
  }

  const result = await db.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name, user_id',
    [name, categoryId]
  );
  return result.rows[0];
}

async function deleteCategory(userId, categoryId) {
  const found = await db.query(
    'SELECT id, name, user_id FROM categories WHERE id = $1',
    [categoryId]
  );
  if (found.rows.length === 0) {
    throw new AppError('카테고리를 찾을 수 없습니다', 404, NOT_FOUND);
  }

  const category = found.rows[0];
  if (category.user_id === null) {
    throw new AppError('기본 카테고리는 삭제할 수 없습니다', 403, FORBIDDEN);
  }
  if (category.user_id !== userId) {
    throw new AppError('해당 카테고리를 삭제할 권한이 없습니다', 403, FORBIDDEN);
  }

  await db.query(
    'UPDATE todos SET category_id = $1 WHERE category_id = $2',
    [DEFAULT_CATEGORY_ID, categoryId]
  );
  await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);
}

module.exports = { getCategoriesByUser, createCategory, updateCategory, deleteCategory };
