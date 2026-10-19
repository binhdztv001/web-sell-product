import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, reloadCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ recipient_name: user.full_name, phone: '', address: '', note: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/orders', form);
      navigate(`/orders/${res.data.id}`, { state: { placed: true } });
      reloadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại');
      // Tồn kho có thể đã đổi, tải lại giỏ để hiện cảnh báo mới nhất
      reloadCart();
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <h1>Thanh toán</h1>
        <p className="empty">
          Giỏ hàng của bạn đang trống. <Link to="/products">Tiếp tục mua sắm</Link>
        </p>
      </div>
    );
  }

  const hasProblem = cart.items.some((i) => !i.in_stock);

  return (
    <div className="container">
      <div className="page-head">
        <h1>Thanh toán</h1>
        <Link to="/cart">← Quay lại giỏ hàng</Link>
      </div>
      {error && <div className="alert alert--error">{error}</div>}

      <form className="cart" onSubmit={handleSubmit}>
        <div className="cart__summary">
          <h2>Thông tin giao hàng</h2>
          <div className="form-group">
            <label>Tên người nhận</label>
            <input value={form.recipient_name} onChange={set('recipient_name')} maxLength={100} required />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="0912345678" required />
          </div>
          <div className="form-group">
            <label>Địa chỉ giao hàng</label>
            <textarea rows={2} value={form.address} onChange={set('address')} maxLength={255} required />
          </div>
          <div className="form-group">
            <label>Ghi chú (không bắt buộc)</label>
            <textarea rows={2} value={form.note} onChange={set('note')} maxLength={500} />
          </div>
          <p className="checkout__method">Phương thức thanh toán: Thanh toán khi nhận hàng (COD)</p>
        </div>

        <aside className="cart__summary">
          <h2>Đơn hàng ({cart.total_quantity})</h2>
          {cart.items.map((item) => (
            <div key={item.product_id} className="cart__row">
              <span>
                {item.name} × {item.quantity}
                {!item.in_stock && <span className="cart-item__warn"> (vượt tồn kho)</span>}
              </span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className="cart__row cart__row--total">
            <span>Tổng cộng</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          {hasProblem && (
            <p className="cart-item__warn">
              Có sản phẩm vượt tồn kho, vui lòng <Link to="/cart">điều chỉnh giỏ hàng</Link>.
            </p>
          )}
          <button className="btn btn--block" disabled={hasProblem || submitting}>
            {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </button>
        </aside>
      </form>
    </div>
  );
}
