const Order = require('../models/orderModel');
const httpError = require('../utils/httpError');
const { maxLength } = require('../utils/validate');

const PHONE_RE = /^(0|\+84)\d{9,10}$/;

// Luồng trạng thái hợp lệ; completed và cancelled là trạng thái cuối
const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed'],
  completed: [],
  cancelled: [],
};

function parseShipping(body) {
  const recipientName = String(body.recipient_name || '').trim();
  const phone = String(body.phone || '').replace(/[\s.-]/g, '');
  const address = String(body.address || '').trim();
  const note = body.note ? String(body.note).trim() : null;

  if (!recipientName) throw httpError(400, 'Vui lòng nhập tên người nhận');
  maxLength(recipientName, 100, 'Tên người nhận');
  if (!PHONE_RE.test(phone)) throw httpError(400, 'Số điện thoại không hợp lệ');
  if (!address) throw httpError(400, 'Vui lòng nhập địa chỉ giao hàng');
  maxLength(address, 255, 'Địa chỉ');
  maxLength(note, 500, 'Ghi chú');
  return { recipientName, phone, address, note: note || null };
}

function parsePaging(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const status = TRANSITIONS[query.status] ? query.status : null;
  return { page, limit, status };
}

async function sendList(res, filter) {
  const { items, total } = await Order.findAll(filter);
  res.json({ items, total, page: filter.page, totalPages: Math.ceil(total / filter.limit) });
}

// Lấy đơn; user thường chỉ xem được đơn của chính mình (trả 404 để không lộ đơn của người khác)
async function findAllowed(req) {
  const order = await Order.findById(req.params.id);
  if (!order || (req.user.role !== 'admin' && order.user_id !== req.user.id)) {
    throw httpError(404, 'Không tìm thấy đơn hàng');
  }
  return order;
}

exports.checkout = async (req, res) => {
  const orderId = await Order.checkout(req.user.id, parseShipping(req.body));
  res.status(201).json(await Order.findById(orderId));
};

exports.myOrders = (req, res) => sendList(res, { ...parsePaging(req.query), userId: req.user.id });

exports.list = (req, res) => sendList(res, parsePaging(req.query));

exports.get = async (req, res) => res.json(await findAllowed(req));

// User tự hủy đơn khi đơn còn chờ xác nhận
exports.cancel = async (req, res) => {
  const ok = await Order.changeStatus(req.params.id, 'cancelled', (order) => {
    if (order.user_id !== req.user.id) throw httpError(404, 'Không tìm thấy đơn hàng');
    if (order.status !== 'pending') throw httpError(400, 'Chỉ hủy được đơn đang chờ xác nhận');
  });
  if (!ok) throw httpError(404, 'Không tìm thấy đơn hàng');
  res.json(await Order.findById(req.params.id));
};

// Admin chuyển trạng thái theo đúng luồng TRANSITIONS
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!TRANSITIONS[status]) throw httpError(400, 'Trạng thái không hợp lệ');

  const ok = await Order.changeStatus(req.params.id, status, (order) => {
    if (!TRANSITIONS[order.status].includes(status)) {
      throw httpError(400, 'Không thể chuyển đơn sang trạng thái này');
    }
  });
  if (!ok) throw httpError(404, 'Không tìm thấy đơn hàng');
  res.json(await Order.findById(req.params.id));
};
