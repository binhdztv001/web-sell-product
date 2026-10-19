const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { signToken } = require('../utils/token');
const { maxLength, checkPassword } = require('../utils/validate');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (u) => ({
  id: u.id,
  full_name: u.full_name,
  email: u.email,
  role: u.role,
});

exports.register = async (req, res, next) => {
  try {
    const fullName = String(req.body.full_name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!fullName) return res.status(400).json({ message: 'Vui lòng nhập họ tên' });
    maxLength(fullName, 100, 'Họ tên');
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
    maxLength(email, 150, 'Email');
    checkPassword(password);
    if (await User.findByEmail(email)) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Luôn tạo role 'user'; không nhận role từ client
    const user = await User.create({ fullName, email, passwordHash });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findByEmail(email);
    // Cùng một thông báo cho cả sai email và sai mật khẩu
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => {
  res.json({ user: publicUser(req.user) });
};
