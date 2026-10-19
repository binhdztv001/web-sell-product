const router = require('express').Router();
const c = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middlewares/auth');

// Ai cũng xem được; chỉ admin mới được thêm/sửa/xóa
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', protect, restrictTo('admin'), c.create);
router.put('/:id', protect, restrictTo('admin'), c.update);
router.delete('/:id', protect, restrictTo('admin'), c.remove);

module.exports = router;
