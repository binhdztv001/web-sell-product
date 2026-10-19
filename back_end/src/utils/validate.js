const httpError = require('./httpError');

// Ném lỗi 400 nếu chuỗi dài quá giới hạn của cột trong database
exports.maxLength = (value, max, label) => {
  if (value && String(value).length > max) {
    throw httpError(400, `${label} không được dài quá ${max} ký tự`);
  }
};

// bcrypt chỉ dùng 72 byte đầu của mật khẩu, nên giới hạn theo byte
exports.checkPassword = (password) => {
  if (password.length < 6) throw httpError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
  if (Buffer.byteLength(password) > 72) throw httpError(400, 'Mật khẩu không được dài quá 72 byte');
};
