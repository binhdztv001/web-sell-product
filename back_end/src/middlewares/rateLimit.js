const rateLimit = require('express-rate-limit');

const make = (windowMs, limit, message, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    ...extra,
  });

// Toàn bộ API: 300 request / phút / IP
exports.globalLimiter = make(60 * 1000, 300, 'Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau');

// Đăng nhập: 10 lần sai / 15 phút / IP (đăng nhập thành công không bị tính)
exports.loginLimiter = make(15 * 60 * 1000, 10, 'Bạn đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút', {
  skipSuccessfulRequests: true,
});

// Đăng ký: 10 tài khoản / giờ / IP để chặn tạo tài khoản rác hàng loạt
exports.registerLimiter = make(60 * 60 * 1000, 10, 'Bạn đã đăng ký quá nhiều tài khoản, vui lòng thử lại sau');
