const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const httpError = require('../utils/httpError');
const { maxLength, checkPassword } = require('../utils/validate');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// requirePassword: true khi tạo mới, false khi sửa (bỏ trống = giữ mật khẩu cũ)
async function parseBody(body, requirePassword) {
  const fullName = String(body.full_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const role = body.role || 'user';
  const password = body.password ? String(body.password) : '';

  if (!fullName) throw httpError(400, 'Vui lòng nhập họ tên');
  maxLength(fullName, 100, 'Họ tên');
  if (!EMAIL_RE.test(email)) throw httpError(400, 'Email không hợp lệ');
  maxLength(email, 150, 'Email');
  if (!['admin', 'user'].includes(role)) throw httpError(400, 'Role không hợp lệ');
  if (requirePassword || password) checkPassword(password);
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  return { fullName, email, role, passwordHash };
}

exports.list = async (req, res) => res.json(await User.findAll());

exports.get = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'Không tìm thấy người dùng');
  res.json(user);
};

exports.create = async (req, res) => {
  res.status(201).json(await User.create(await parseBody(req.body, true)));
};

exports.update = async (req, res) => {
  const data = await parseBody(req.body, false);
  // Tránh admin tự hạ quyền chính mình rồi không còn ai quản trị
  if (Number(req.params.id) === req.user.id && data.role !== 'admin') {
    throw httpError(400, 'Bạn không thể tự bỏ quyền admin của mình');
  }
  const user = await User.update(req.params.id, data);
  if (!user) throw httpError(404, 'Không tìm thấy người dùng');
  res.json(user);
};

exports.remove = async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    throw httpError(400, 'Bạn không thể tự xóa tài khoản của mình');
  }
  if (!(await User.remove(req.params.id))) throw httpError(404, 'Không tìm thấy người dùng');
  res.status(204).end();
};
