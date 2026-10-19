const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Yêu cầu đăng nhập: đọc token từ header "Authorization: Bearer <token>"
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Lấy lại user từ DB để role luôn đúng và user đã bị xóa thì không dùng được token cũ
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    next(err);
  }
};

// Phân quyền: dùng sau protect, ví dụ restrictTo('admin')
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
    }
    next();
  };
