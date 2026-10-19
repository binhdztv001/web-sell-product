const Product = require('../models/productModel');
const httpError = require('../utils/httpError');
const { deleteImageByUrl } = require('../config/cloudinary');
const { maxLength } = require('../utils/validate');

function parseBody(body) {
  const name = String(body.name || '').trim();
  if (!name) throw httpError(400, 'Vui lòng nhập tên sản phẩm');
  maxLength(name, 200, 'Tên sản phẩm');
  maxLength(body.image_url, 500, 'Link ảnh');

  const price = Number(body.price);
  if (body.price === undefined || body.price === '' || !Number.isFinite(price) || price < 0) {
    throw httpError(400, 'Giá không hợp lệ');
  }
  const stock = body.stock === undefined || body.stock === '' ? 0 : Number(body.stock);
  if (!Number.isInteger(stock) || stock < 0) throw httpError(400, 'Số lượng tồn kho không hợp lệ');

  const hasCategory = body.category_id !== undefined && body.category_id !== null && body.category_id !== '';
  const categoryId = hasCategory ? Number(body.category_id) : null;
  if (hasCategory && !Number.isInteger(categoryId)) throw httpError(400, 'Danh mục không hợp lệ');

  return {
    categoryId,
    name,
    description: body.description ? String(body.description).trim() : null,
    price,
    stock,
    imageUrl: body.image_url ? String(body.image_url).trim() : null,
  };
}

exports.list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
  const categoryId = parseInt(req.query.category_id, 10) || null;
  const search = String(req.query.search || '').trim();

  const { items, total } = await Product.findAll({ categoryId, search, page, limit });
  res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
};

exports.get = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Không tìm thấy sản phẩm');
  res.json(product);
};

exports.create = async (req, res) => {
  res.status(201).json(await Product.create(parseBody(req.body)));
};

exports.update = async (req, res) => {
  const old = await Product.findById(req.params.id);
  if (!old) throw httpError(404, 'Không tìm thấy sản phẩm');
  const product = await Product.update(req.params.id, parseBody(req.body));
  if (!product) throw httpError(404, 'Không tìm thấy sản phẩm');
  if (old.image_url !== product.image_url) await cleanupImage(old.image_url);
  res.json(product);
};

exports.remove = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !(await Product.remove(req.params.id))) throw httpError(404, 'Không tìm thấy sản phẩm');
  await cleanupImage(product.image_url);
  res.status(204).end();
};

// Xóa ảnh không còn dùng trên Cloudinary để không để lại ảnh rác.
// Đơn hàng cũ vẫn hiển thị ảnh lúc mua (order_items.image_url) nên ảnh đó phải giữ lại.
async function cleanupImage(url) {
  if (url && !(await Product.isImageInOrders(url))) await deleteImageByUrl(url);
}
