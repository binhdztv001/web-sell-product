const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = 'web_sell_product/products';

// Upload buffer ảnh (từ multer) lên Cloudinary; thu nhỏ ảnh quá lớn và chuyển sang WebP cho nhẹ
exports.uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: FOLDER,
          resource_type: 'image',
          format: 'webp',
          transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      )
      .end(buffer);
  });

// Xóa ảnh theo URL; chỉ xóa ảnh nằm trong thư mục của web này, link ảnh ngoài thì bỏ qua
exports.deleteImageByUrl = async (url) => {
  const match = url?.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  if (!match || match[1] !== process.env.CLOUDINARY_CLOUD_NAME || !match[2].startsWith(`${FOLDER}/`)) return;
  try {
    await cloudinary.uploader.destroy(match[2]);
  } catch (err) {
    // Không xóa được ảnh cũ không nên làm hỏng thao tác chính
    console.error('Không xóa được ảnh Cloudinary:', err.message);
  }
};
