const router = require('express').Router();
const c = require('../controllers/uploadController');
const upload = require('../middlewares/upload');
const { protect, restrictTo } = require('../middlewares/auth');

// Chỉ admin được upload ảnh sản phẩm; field trong form-data tên là "image"
router.post('/image', protect, restrictTo('admin'), upload.single('image'), c.image);

module.exports = router;
