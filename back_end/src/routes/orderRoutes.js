const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect);

// User: đặt hàng, xem và hủy đơn của mình
router.post('/', c.checkout);
router.get('/my', c.myOrders);
router.patch('/:id/cancel', c.cancel);

// Admin: xem tất cả đơn và đổi trạng thái
router.get('/', restrictTo('admin'), c.list);
router.patch('/:id/status', restrictTo('admin'), c.updateStatus);

// Chủ đơn hoặc admin
router.get('/:id', c.get);

module.exports = router;
