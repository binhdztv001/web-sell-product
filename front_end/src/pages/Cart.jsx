import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Chạy một thao tác giỏ hàng và hiện lỗi nếu có
  const act = async (fn) => {
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    }
  };

  const hasProblem = cart.items.some((i) => !i.in_stock);

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <h1>Giỏ hàng</h1>
        <p className="empty">
          Giỏ hàng của bạn đang trống. <Link to="/products">Tiếp tục mua sắm</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <h1>Giỏ hàng ({cart.total_quantity})</h1>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => window.confirm('Xóa toàn bộ giỏ hàng?') && act(clearCart)}
        >
          Xóa tất cả
        </button>
      </div>
      {error && <div className="alert alert--error">{error}</div>}

      <div className="cart">
        <div className="cart__list">
          {cart.items.map((item) => (
            <div key={item.product_id} className="cart-item">
              <Link to={`/products/${item.product_id}`} className="cart-item__img">
                <ProductImage product={item} />
              </Link>
              <div className="cart-item__info">
                <Link to={`/products/${item.product_id}`} className="card__name">
                  {item.name}
                </Link>
                <span className="card__price">{formatPrice(item.price)}</span>
                {!item.in_stock && (
                  <span className="cart-item__warn">
                    {item.stock > 0 ? `Chỉ còn ${item.stock} sản phẩm, vui lòng giảm số lượng` : 'Sản phẩm đã hết hàng'}
                  </span>
                )}
              </div>
              <div className="qty">
                <button
                  disabled={item.quantity <= 1}
                  onClick={() => act(() => updateQuantity(item.product_id, item.quantity - 1))}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  disabled={item.quantity >= item.stock}
                  onClick={() => act(() => updateQuantity(item.product_id, item.quantity + 1))}
                >
                  +
                </button>
              </div>
              <div className="cart-item__subtotal">{formatPrice(item.subtotal)}</div>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => act(() => removeItem(item.product_id))}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        <aside className="cart__summary">
          <h2>Tổng đơn hàng</h2>
          <div className="cart__row">
            <span>Số lượng</span>
            <span>{cart.total_quantity}</span>
          </div>
          <div className="cart__row cart__row--total">
            <span>Tổng cộng</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          {hasProblem && <p className="cart-item__warn">Vui lòng điều chỉnh các sản phẩm vượt tồn kho.</p>}
          <button className="btn btn--block" disabled={hasProblem} onClick={() => navigate('/checkout')}>
            Thanh toán
          </button>
        </aside>
      </div>
    </div>
  );
}
