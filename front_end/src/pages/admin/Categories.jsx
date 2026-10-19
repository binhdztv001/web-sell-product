import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';

const EMPTY = { name: '', description: '' };

export default function Categories() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null = đóng, {id?, ...} = đang mở form
  const [error, setError] = useState('');

  const load = () => api.get('/categories').then((res) => setItems(res.data));
  useEffect(() => {
    load();
  }, []);

  const open = (c) => {
    setError('');
    setEditing(c ? { id: c.id, name: c.name, description: c.description || '' } : { ...EMPTY });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, ...body } = editing;
      await (id ? api.put(`/categories/${id}`, body) : api.post('/categories', body));
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Xóa danh mục "${c.name}"? Các sản phẩm thuộc danh mục sẽ chuyển thành chưa phân loại.`)) return;
    try {
      await api.delete(`/categories/${c.id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Danh mục</h1>
        <button className="btn" onClick={() => open()}>+ Thêm danh mục</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Tên</th><th>Mô tả</th><th>Số sản phẩm</th><th /></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>{c.product_count}</td>
                <td className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => open(c)}>Sửa</button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(c)}>Xóa</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="empty">Chưa có danh mục nào</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Sửa danh mục' : 'Thêm danh mục'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert--error">{error}</div>}
            <div className="form-group">
              <label>Tên danh mục</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="modal__footer">
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>Hủy</button>
              <button className="btn">Lưu</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
