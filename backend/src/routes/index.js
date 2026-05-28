const { Router } = require('express');
const authRouter = require('./auth');
const usersRouter = require('./users');
const categoriesRouter = require('./categories');

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/categories', categoriesRouter);

// 추후 /todos 라우터를 여기에 마운트
// router.use('/todos', todosRouter);

module.exports = router;
