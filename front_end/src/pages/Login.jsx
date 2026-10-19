import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đăng nhập');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
        <p className="auth__sub">Chào mừng bạn quay lại</p>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn--block" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
        <p className="auth__footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}
