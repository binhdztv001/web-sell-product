import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin__side">
        <NavLink to="/admin" end>Tổng quan</NavLink>
        <NavLink to="/admin/users">Người dùng</NavLink>
        <NavLink to="/admin/categories">Danh mục</NavLink>
        <NavLink to="/admin/products">Sản phẩm</NavLink>
        <NavLink to="/admin/orders">Đơn hàng</NavLink>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
