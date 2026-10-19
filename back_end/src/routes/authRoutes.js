const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimit');

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, me);

module.exports = router;
