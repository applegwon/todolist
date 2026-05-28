const { Router } = require('express');
const authRouter = require('./auth');
const usersRouter = require('./users');
const categoriesRouter = require('./categories');
const todosRouter = require('./todos');

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/categories', categoriesRouter);
router.use('/todos', todosRouter);

module.exports = router;
