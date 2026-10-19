const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/auth');

// Toàn bộ quản lý người dùng chỉ dành cho admin
router.use(protect, restrictTo('admin'));

router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
