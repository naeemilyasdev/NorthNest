import { createContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { cartService } from '../services/cartService.js';
import { showToast } from '../utils/toast';

const CART_STORAGE_KEY = 'purely-himalayan-guest-cart';

const normalizeId = (value) => {
  if (value == null) return '';
  if (typeof value === 'object' && value.toString) return value.toString();
  return String(value);
};

const mergeCartItems = (items = []) => {
  const map = new Map();

  for (const item of items) {
    const key = normalizeId(item.productId);
    if (!key) continue;

    const existing = map.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      existing.price = item.price || existing.price;
      existing.product = existing.product || item.product;
    } else {
      map.set(key, { ...item, productId: key });
    }
  }

  return Array.from(map.values());
};

const buildCartSnapshot = (items = []) => {
  const normalizedItems = mergeCartItems(
    (items || [])
      .map((item) => {
        const productData = item.product || item.productData || (typeof item.productId === 'object' && item.productId !== null ? item.productId : null);
        const productId = normalizeId(productData?._id || item.productId?._id || item.productId || productData?.id || item.id);
        const quantity = Number(item.quantity || 1);
        const price = Number(productData?.price ?? item.price ?? 0);

        return {
          productId,
          quantity,
          product: productData,
          price,
        };
      })
      .filter((item) => item.productId)
  );

  const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items: normalizedItems,
    itemCount,
    total,
  };
};

const readLocalCart = () => {
  if (typeof window === 'undefined') {
    return buildCartSnapshot([]);
  }

  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) {
      return buildCartSnapshot([]);
    }

    const parsed = JSON.parse(saved);
    return buildCartSnapshot(parsed.items || []);
  } catch {
    return buildCartSnapshot([]);
  }
};

const persistLocalCart = (cart) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(() => readLocalCart());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setCart(readLocalCart());
      return;
    }

    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const syncCartState = (value) => {
    const nextCart = buildCartSnapshot(value?.items || value || []);
    setCart(nextCart);

    if (!isAuthenticated) {
      persistLocalCart(nextCart);
    }

    return nextCart;
  };

  const fetchCart = async () => {
    if (!isAuthenticated) {
      return syncCartState(readLocalCart());
    }

    try {
      setLoading(true);
      const response = await cartService.getCart();
      const serverCart = response?.data || response || null;
      const fallback = readLocalCart();
      const hasServerItems = Array.isArray(serverCart?.items) ? serverCart.items.length > 0 : Boolean((serverCart?.itemCount ?? 0) > 0 || (serverCart?.total ?? 0) > 0);
      const nextCart = hasServerItems
        ? syncCartState(serverCart)
        : (cart?.items?.length || fallback?.items?.length)
          ? syncCartState({ items: [...(cart?.items || []), ...(fallback?.items || [])] })
          : syncCartState(serverCart || { items: [] });

      setError(null);
      return nextCart;
    } catch (err) {
      const fallback = readLocalCart();
      setCart(fallback);
      setError(err.message || 'Failed to fetch cart');
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const normalizedProduct = typeof product === 'object' && product !== null
      ? product
      : { _id: product, id: product, name: 'Product', price: 0, image: '', category: 'General' };
    const productId = normalizeId(normalizedProduct._id || normalizedProduct.id || product);

    if (!isAuthenticated) {
      const currentItems = [...(cart?.items || [])];
      const existingIndex = currentItems.findIndex((item) => normalizeId(item.productId || item.product?._id || item.product?.id) === productId);

      if (existingIndex >= 0) {
        currentItems[existingIndex].quantity += quantity;
      } else {
        currentItems.push({ productId, quantity, product: normalizedProduct, price: normalizedProduct.price });
      }

      const nextCart = syncCartState({ items: currentItems });
      showToast('Added to cart', 'success');
      return nextCart;
    }

    try {
      setError(null);
      const response = await cartService.addToCart({ productId, quantity });
      const nextCart = syncCartState(response?.data || response || []);
      showToast('Added to cart', 'success');
      return nextCart;
    } catch (err) {
      const currentItems = [...(cart?.items || [])];
      const existingIndex = currentItems.findIndex((item) => (item.productId || item.product?._id || item.product?.id) === productId);

      if (existingIndex >= 0) {
        currentItems[existingIndex].quantity += quantity;
      } else {
        currentItems.push({ productId, quantity, product: normalizedProduct });
      }

      const nextCart = syncCartState({ items: currentItems });
      showToast('Added to cart locally', 'success');
      return nextCart;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) {
      const currentItems = [...(cart?.items || [])].map((item) => ({ ...item, quantity: normalizeId(item.productId || item.product?._id || item.product?.id) === productId ? quantity : item.quantity }));
      const nextCart = syncCartState({ items: currentItems });
      return nextCart;
    }

    try {
      setError(null);
      const response = await cartService.updateCartItem({ productId, quantity });
      const nextCart = syncCartState(response?.data || response || []);
      return nextCart;
    } catch (err) {
      const currentItems = [...(cart?.items || [])].map((item) => ({ ...item, quantity: normalizeId(item.productId || item.product?._id || item.product?.id) === productId ? quantity : item.quantity }));
      const nextCart = syncCartState({ items: currentItems });
      setError(err.message || 'Failed to update cart');
      return nextCart;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      const currentItems = [...(cart?.items || [])].filter((item) => normalizeId(item.productId || item.product?._id || item.product?.id) !== productId);
      const nextCart = syncCartState({ items: currentItems });
      return nextCart;
    }

    try {
      setError(null);
      const response = await cartService.removeFromCart(productId);
      const nextCart = syncCartState(response?.data || response || []);
      return nextCart;
    } catch (err) {
      const currentItems = [...(cart?.items || [])].filter((item) => normalizeId(item.productId || item.product?._id || item.product?.id) !== productId);
      const nextCart = syncCartState({ items: currentItems });
      setError(err.message || 'Failed to remove cart item');
      return nextCart;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      const nextCart = syncCartState({ items: [] });
      return nextCart;
    }

    try {
      setError(null);
      const response = await cartService.clearCart();
      const nextCart = syncCartState(response?.data || response || []);
      return nextCart;
    } catch (err) {
      const nextCart = syncCartState({ items: [] });
      setError(err.message || 'Failed to clear cart');
      return nextCart;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
