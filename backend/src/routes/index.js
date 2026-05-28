const { Router } = require('express');
const authRouter = require('./auth');
const usersRouter = require('./users');

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);

// 추후 /categories, /todos 라우터를 여기에 마운트
// router.use('/categories', categoriesRouter);
// router.use('/todos', todosRouter);

module.exports = router;
