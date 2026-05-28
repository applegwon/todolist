const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const todoController = require('../controllers/todoController');

router.get('/', authMiddleware, todoController.getTodos);
router.post('/', authMiddleware, todoController.createTodo);
router.patch('/:id', authMiddleware, todoController.updateTodo);
router.delete('/:id', authMiddleware, todoController.deleteTodo);

module.exports = router;
