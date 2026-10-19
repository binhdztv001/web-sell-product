import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

const EMPTY = { full_name: '', email: '', role: 'user', password: '' };

export default function Users() {
  const { user: me } = useAuth();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/users').then((res) => setItems(res.data));
  useEffect(() => {
    load();
  }, []);

  const open = (u) => {
    setError('');
    setEditing(u ? { id: u.id, full_name: u.full_name, email: u.email, role: u.role, password: '' } : { ...EMPTY });
  };

  const set = (field) => (e) => setEditing({ ...editing, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, ...body } = editing;
      await (id ? api.put(`/users/${id}`, body) : api.post('/users', body));
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Xóa người dùng "${u.full_name}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Người dùng</h1>
        <button className="btn" onClick={() => open()}>+ Thêm người dùng</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Ngày tạo</th><th /></tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.full_name}{u.id === me.id && ' (bạn)'}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge--admin' : ''}`}>{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => open(u)}>Sửa</button>
                  <button className="btn btn--danger btn--sm" disabled={u.id === me.id} onClick={() => handleDelete(u)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Sửa người dùng' : 'Thêm người dùng'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert--error">{error}</div>}
            <div className="form-group">
              <label>Họ tên</label>
              <input value={editing.full_name} onChange={set('full_name')} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={editing.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <select value={editing.role} onChange={set('role')} disabled={editing.id === me.id}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>{editing.id ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu'}</label>
              <input type="password" minLength={6} value={editing.password} onChange={set('password')} required={!editing.id} />
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
