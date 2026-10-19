const multer = require('multer');
const httpError = require('../utils/httpError');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Giữ file trong RAM (req.file.buffer) để đẩy thẳng lên Cloudinary, không ghi ra ổ đĩa server.
// mimetype do client gửi nên có thể giả; Cloudinary sẽ từ chối nếu nội dung không phải ảnh thật.
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(httpError(400, 'Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF'));
  },
});
