import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products', { params: { limit: 8 } }).then((res) => setProducts(res.data.items));
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <h1>Mua sắm dễ dàng</h1>
        <p>Khám phá các sản phẩm mới nhất với giá tốt.</p>
        <Link to="/products" className="btn">
          Xem sản phẩm
        </Link>
      </section>

      {categories.length > 0 && (
        <>
          <div className="section-title">
            <h2>Danh mục</h2>
          </div>
          <div className="chips">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category_id=${c.id}`} className="chip">
                {c.name}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="section-title">
        <h2>Sản phẩm mới</h2>
        <Link to="/products">Xem tất cả</Link>
      </div>
      {products.length === 0 ? (
        <p className="empty">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
