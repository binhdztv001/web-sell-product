import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';

// Bộ lọc nằm trên URL (?search=&category_id=&page=) để chia sẻ và quay lại được
export default function Products() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const search = params.get('search') || '';
  const categoryId = params.get('category_id') || '';
  const page = Number(params.get('page')) || 1;
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { search, category_id: categoryId || undefined, page, limit: 12 } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [search, categoryId, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    update({ search: searchInput.trim(), page: '' });
  };

  return (
    <div className="container">
      <h1>Sản phẩm</h1>
      <form className="toolbar" onSubmit={handleSearch}>
        <input placeholder="Tìm sản phẩm..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <button className="btn">Tìm</button>
      </form>
      <div className="chips" style={{ marginBottom: 20 }}>
        <button className={`chip ${!categoryId ? 'chip--active' : ''}`} onClick={() => update({ category_id: '', page: '' })}>
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${String(c.id) === categoryId ? 'chip--active' : ''}`}
            onClick={() => update({ category_id: String(c.id), page: '' })}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <p className="empty">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="grid">
          {data.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => update({ page: p > 1 ? String(p) : '' })} />
    </div>
  );
}
