import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Mật khẩu nhập lại không khớp');
    setSubmitting(true);
    try {
      await register(form.full_name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1>Đăng ký</h1>
        <p className="auth__sub">Tạo tài khoản mới</p>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-group">
          <label htmlFor="full_name">Họ tên</label>
          <input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input id="password" name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Nhập lại mật khẩu</label>
          <input id="confirm" name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
        </div>
        <button className="btn btn--block" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
        <p className="auth__footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
