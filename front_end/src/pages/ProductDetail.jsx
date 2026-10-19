import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ProductImage from '../components/ProductImage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!user) return navigate('/login');
    setMessage(null);
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      setMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng' });
      setQuantity(1);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setQuantity(1);
    setMessage(null);
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="container">
        <p className="empty">Không tìm thấy sản phẩm. <Link to="/products">Quay lại danh sách</Link></p>
      </div>
    );
  }
  if (!product) return <div className="container"><p className="empty">Đang tải...</p></div>;

  return (
    <div className="container">
      <p><Link to="/products">← Quay lại danh sách</Link></p>
      <div className="detail">
        <ProductImage product={product} />
        <div>
          <span className="card__cat">{product.category_name || 'Chưa phân loại'}</span>
          <h1>{product.name}</h1>
          <div className="detail__price">{formatPrice(product.price)}</div>
          <p className="detail__desc">{product.description || 'Chưa có mô tả.'}</p>
          <p className="detail__stock">{product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}</p>
          {message && <div className={`alert alert--${message.type}`}>{message.text}</div>}
          <div className="add-to-cart">
            {product.stock > 0 && (
              <div className="qty">
                <button disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}>−</button>
                <span>{quantity}</span>
                <button disabled={quantity >= product.stock} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            )}
            <button className="btn" disabled={product.stock <= 0 || adding} onClick={handleAdd}>
              {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
