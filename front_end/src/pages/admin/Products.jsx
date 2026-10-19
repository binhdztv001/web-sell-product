import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { formatPrice } from '../../utils/format';

const EMPTY = { name: '', category_id: '', price: '', stock: 0, image_url: '', description: '' };
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function Products() {
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => api.get('/products', { params: { page, limit: 10 } }).then((res) => setData(res.data));

  useEffect(() => {
    load();
  }, [page]);
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const open = (p) => {
    setError('');
    setEditing(
      p
        ? {
            id: p.id,
            name: p.name,
            category_id: p.category_id ?? '',
            price: p.price,
            stock: p.stock,
            image_url: p.image_url || '',
            description: p.description || '',
          }
        : { ...EMPTY }
    );
  };

  const set = (field) => (e) => setEditing({ ...editing, [field]: e.target.value });

  // Upload ngay khi chọn file; server trả về URL Cloudinary để lưu vào image_url
  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return setError('Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF');
    if (file.size > MAX_IMAGE_SIZE) return setError('Ảnh không được lớn hơn 5MB');

    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post('/uploads/image', form);
      // Dùng prev vì người dùng có thể sửa các ô khác trong lúc đang upload
      setEditing((prev) => prev && { ...prev, image_url: res.data.url });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, ...body } = editing;
      await (id ? api.put(`/products/${id}`, body) : api.post('/products', body));
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Xóa sản phẩm "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      // Xóa dòng cuối của trang thì lùi về trang trước
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Sản phẩm</h1>
        <button className="btn" onClick={() => open()}>+ Thêm sản phẩm</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th /></tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.image_url ? <img src={p.image_url} alt="" /> : '-'}</td>
                <td>{p.name}</td>
                <td>{p.category_name || '-'}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.stock}</td>
                <td className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => open(p)}>Sửa</button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p)}>Xóa</button>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && <tr><td colSpan={7} className="empty">Chưa có sản phẩm nào</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />

      {editing && (
        <Modal title={editing.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert--error">{error}</div>}
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input value={editing.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select value={editing.category_id} onChange={set('category_id')}>
                <option value="">Chưa phân loại</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Giá (VNĐ)</label>
              <input type="number" min="0" step="1000" value={editing.price} onChange={set('price')} required />
            </div>
            <div className="form-group">
              <label>Tồn kho</label>
              <input type="number" min="0" step="1" value={editing.stock} onChange={set('stock')} required />
            </div>
            <div className="form-group">
              <label>Ảnh sản phẩm</label>
              <div className="image-upload">
                {editing.image_url ? (
                  <img src={editing.image_url} alt="" />
                ) : (
                  <div className="image-upload__empty">Chưa có ảnh</div>
                )}
                <div className="image-upload__actions">
                  <label className="btn btn--ghost btn--sm">
                    {uploading ? 'Đang tải lên...' : 'Chọn ảnh từ máy'}
                    <input type="file" accept={IMAGE_TYPES.join(',')} hidden disabled={uploading} onChange={handleFile} />
                  </label>
                  {editing.image_url && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing({ ...editing, image_url: '' })}>
                      Bỏ ảnh
                    </button>
                  )}
                  <small>JPG, PNG, WEBP, GIF • tối đa 5MB</small>
                </div>
              </div>
              <input value={editing.image_url} onChange={set('image_url')} placeholder="hoặc dán link ảnh https://..." />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea rows={3} value={editing.description} onChange={set('description')} />
            </div>
            <div className="modal__footer">
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>Hủy</button>
              <button className="btn" disabled={uploading}>Lưu</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
