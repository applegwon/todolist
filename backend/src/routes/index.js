const { Router } = require('express');
const authRouter = require('./auth');

const router = Router();

router.use('/auth', authRouter);

// 추후 /users, /categories, /todos 라우터를 여기에 마운트
// router.use('/users', usersRouter);
// router.use('/categories', categoriesRouter);
// router.use('/todos', todosRouter);

module.exports = router;
