const { query } = require('../db/db');
const AppError = require('../utils/errors');
const { NOT_FOUND, MISSING_FIELD, TODO_FORBIDDEN, INVALID_DATE_RANGE } = require('../constants/errorCodes');
const { DEFAULT_CATEGORY_ID } = require('../constants/dbDefaults');

const IS_OVERDUE_EXPR = `CASE WHEN end_date IS NOT NULL AND end_date < CURRENT_DATE AND status != '완료' THEN true ELSE false END AS is_overdue`;

const RETURNING_FIELDS = `RETURNING id, title, description, start_date, end_date, status, category_id, user_id, created_at, updated_at, ${IS_OVERDUE_EXPR}`;

async function getTodos(userId, filters = {}) {
  const { category, status, overdue } = filters;
  const values = [userId];
  const conditions = [];

  if (category !== undefined) {
    values.push(category);
    conditions.push(`category_id = $${values.length}`);
  }

  if (status !== undefined) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (overdue === 'true') {
    conditions.push(`end_date IS NOT NULL AND end_date < CURRENT_DATE AND status != '완료'`);
  }

  const where = conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '';

  const sql = `
    SELECT id, title, description, start_date, end_date, status,
           category_id, user_id, created_at, updated_at,
           ${IS_OVERDUE_EXPR}
    FROM todos
    WHERE user_id = $1${where}
    ORDER BY created_at DESC
  `;

  const result = await query(sql, values);
  return result.rows;
}

async function createTodo(userId, data) {
  const { title, description = null, start_date = null, end_date = null } = data;
  const category_id = data.category_id != null ? data.category_id : DEFAULT_CATEGORY_ID;

  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    throw new AppError('종료일자는 시작일자보다 이전일 수 없습니다', 400, INVALID_DATE_RANGE);
  }

  const sql = `
    INSERT INTO todos (title, description, category_id, start_date, end_date, status, user_id)
    VALUES ($1, $2, $3, $4, $5, '미시작', $6)
    ${RETURNING_FIELDS}
  `;

  const result = await query(sql, [title, description, category_id, start_date, end_date, userId]);
  return result.rows[0];
}

async function updateTodo(userId, todoId, data) {
  const existingResult = await query('SELECT * FROM todos WHERE id = $1', [todoId]);

  if (existingResult.rows.length === 0) {
    throw new AppError('할일을 찾을 수 없습니다', 404, NOT_FOUND);
  }

  const existing = existingResult.rows[0];

  if (existing.user_id !== userId) {
    throw new AppError('해당 할일을 수정할 권한이 없습니다', 403, TODO_FORBIDDEN);
  }

  const finalStartDate = data.start_date !== undefined ? data.start_date : existing.start_date;
  const finalEndDate = data.end_date !== undefined ? data.end_date : existing.end_date;

  if (finalStartDate && finalEndDate && new Date(finalEndDate) < new Date(finalStartDate)) {
    throw new AppError('종료일자는 시작일자보다 이전일 수 없습니다', 400, INVALID_DATE_RANGE);
  }

  const allowedFields = ['title', 'description', 'category_id', 'start_date', 'end_date', 'status'];
  const setClauses = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      values.push(data[field]);
      setClauses.push(`${field} = $${values.length}`);
    }
  }

  if (setClauses.length === 0) {
    throw new AppError('수정할 항목이 없습니다', 400, MISSING_FIELD);
  }

  values.push(todoId);
  const sql = `
    UPDATE todos
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length}
    ${RETURNING_FIELDS}
  `;

  const result = await query(sql, values);
  return result.rows[0];
}

async function deleteTodo(userId, todoId) {
  const existingResult = await query('SELECT user_id FROM todos WHERE id = $1', [todoId]);

  if (existingResult.rows.length === 0) {
    throw new AppError('할일을 찾을 수 없습니다', 404, NOT_FOUND);
  }

  const todo = existingResult.rows[0];

  if (todo.user_id !== userId) {
    throw new AppError('해당 할일을 삭제할 권한이 없습니다', 403, TODO_FORBIDDEN);
  }

  await query('DELETE FROM todos WHERE id = $1', [todoId]);
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
