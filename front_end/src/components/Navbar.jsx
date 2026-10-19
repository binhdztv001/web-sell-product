import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          Web Sell Product
        </Link>
        <div className="navbar__links">
          <Link to="/products">Sản phẩm</Link>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin">Quản trị</Link>}
              <Link to="/orders">Đơn hàng</Link>
              <Link to="/cart" className="navbar__cart">
                Giỏ hàng
                {cart.total_quantity > 0 && <span className="badge-count">{cart.total_quantity}</span>}
              </Link>
              <span className="navbar__user">Xin chào, {user.full_name}</span>
              <button className="btn btn--ghost" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register" className="btn">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
