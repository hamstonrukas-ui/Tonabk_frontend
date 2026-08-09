import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  const addToCart = (id) => setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const decFromCart = (id) =>
    setCart((p) => {
      const qty = (p[id] || 0) - 1;
      const next = { ...p };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  const removeFromCart = (id) =>
    setCart((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  const clearCart = () => setCart({});

  return (
    <CartContext.Provider value={{ cart, addToCart, decFromCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
