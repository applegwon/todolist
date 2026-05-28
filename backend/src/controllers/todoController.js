const todoService = require('../services/todoService');
const AppError = require('../utils/errors');
const { MISSING_FIELD } = require('../constants/errorCodes');

async function getTodos(req, res, next) {
  try {
    const { category, status, overdue } = req.query;
    const todos = await todoService.getTodos(req.user.id, { category, status, overdue });
    res.status(200).json(todos);
  } catch (err) {
    next(err);
  }
}

async function createTodo(req, res, next) {
  try {
    const { title, description, category_id, start_date, end_date } = req.body;

    if (!title) {
      throw new AppError('제목은 필수입니다', 400, MISSING_FIELD);
    }

    const todo = await todoService.createTodo(req.user.id, { title, description, category_id, start_date, end_date });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const todoId = parseInt(req.params.id, 10);
    const { title, description, category_id, start_date, end_date, status } = req.body;

    const todo = await todoService.updateTodo(req.user.id, todoId, { title, description, category_id, start_date, end_date, status });
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    const todoId = parseInt(req.params.id, 10);
    await todoService.deleteTodo(req.user.id, todoId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
