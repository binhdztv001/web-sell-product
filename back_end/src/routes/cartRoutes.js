const router = require('express').Router();
const c = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

// Giỏ hàng gắn với user đăng nhập; user chỉ thao tác được trên giỏ của chính mình
router.use(protect);

router.get('/', c.get);
router.post('/', c.add);
router.delete('/', c.clear);
router.put('/:productId', c.updateQuantity);
router.delete('/:productId', c.remove);

module.exports = router;
