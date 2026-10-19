const { uploadImage } = require('../config/cloudinary');
const httpError = require('../utils/httpError');

exports.image = async (req, res) => {
  if (!req.file) throw httpError(400, 'Vui lòng chọn ảnh');
  if (!process.env.CLOUDINARY_CLOUD_NAME) throw httpError(500, 'Server chưa cấu hình Cloudinary');

  try {
    const result = await uploadImage(req.file.buffer);
    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    // Cloudinary trả 400 khi file không phải ảnh hợp lệ
    if (err.http_code === 400) throw httpError(400, 'File không phải ảnh hợp lệ');
    throw err;
  }
};
