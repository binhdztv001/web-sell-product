import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const EMPTY_CART = { items: [], total: 0, total_quantity: 0 };
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);

  const reloadCart = () => api.get('/cart').then((res) => setCart(res.data));

  // Tải giỏ khi đăng nhập, xóa khỏi bộ nhớ khi đăng xuất
  useEffect(() => {
    if (!user) {
      setCart(EMPTY_CART);
      return;
    }
    reloadCart();
  }, [user?.id]);

  // Mỗi thao tác trả về giỏ mới; lỗi (vượt tồn kho...) được ném lại cho component hiển thị
  const run = async (request) => {
    try {
      const res = await request;
      setCart(res.data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const addToCart = (productId, quantity = 1) =>
    run(api.post('/cart', { product_id: productId, quantity }));
  const updateQuantity = (productId, quantity) =>
    run(api.put(`/cart/${productId}`, { quantity }));
  const removeItem = (productId) => run(api.delete(`/cart/${productId}`));
  const clearCart = () => run(api.delete('/cart'));

  return (
    <CartContext.Provider value={{ cart, reloadCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
