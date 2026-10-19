const Cart = require('../models/cartModel');
const httpError = require('../utils/httpError');

// Trả về giỏ hàng kèm tổng tiền; in_stock = false nếu tồn kho đã giảm xuống dưới số lượng trong giỏ
async function buildCart(userId) {
  const items = (await Cart.findByUser(userId)).map((i) => ({
    ...i,
    in_stock: i.quantity <= i.stock,
  }));
  return {
    items,
    total_quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    total: items.reduce((sum, i) => sum + i.subtotal, 0),
  };
}

function parseId(value, message) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw httpError(400, message);
  return n;
}

function parseQuantity(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw httpError(400, 'Số lượng phải là số nguyên dương');
  return n;
}

const stockError = (stock) =>
  httpError(400, stock > 0 ? `Chỉ còn ${stock} sản phẩm trong kho` : 'Sản phẩm đã hết hàng');

exports.get = async (req, res) => res.json(await buildCart(req.user.id));

exports.add = async (req, res) => {
  const productId = parseId(req.body.product_id, 'Sản phẩm không hợp lệ');
  const quantity = req.body.quantity === undefined ? 1 : parseQuantity(req.body.quantity);

  if (!(await Cart.add(req.user.id, productId, quantity))) {
    const product = await Cart.getProduct(productId);
    if (!product) throw httpError(404, 'Không tìm thấy sản phẩm');
    const inCart = (await Cart.getQuantity(req.user.id, productId)) || 0;
    if (inCart > 0 && product.stock > 0) {
      throw httpError(400, `Chỉ còn ${product.stock} sản phẩm trong kho, bạn đã có ${inCart} trong giỏ`);
    }
    throw stockError(product.stock);
  }
  res.status(201).json(await buildCart(req.user.id));
};

exports.updateQuantity = async (req, res) => {
  const productId = parseId(req.params.productId, 'Sản phẩm không hợp lệ');
  const quantity = parseQuantity(req.body.quantity);

  if (!(await Cart.setQuantity(req.user.id, productId, quantity))) {
    if ((await Cart.getQuantity(req.user.id, productId)) === undefined) {
      throw httpError(404, 'Sản phẩm không có trong giỏ hàng');
    }
    throw stockError((await Cart.getProduct(productId)).stock);
  }
  res.json(await buildCart(req.user.id));
};

exports.remove = async (req, res) => {
  const productId = parseId(req.params.productId, 'Sản phẩm không hợp lệ');
  if (!(await Cart.remove(req.user.id, productId))) {
    throw httpError(404, 'Sản phẩm không có trong giỏ hàng');
  }
  res.json(await buildCart(req.user.id));
};

exports.clear = async (req, res) => {
  await Cart.clear(req.user.id);
  res.json(await buildCart(req.user.id));
};
