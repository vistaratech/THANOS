import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CURRENCY_RATES = {
  INR: { rate: 1, symbol: '₹', label: 'INR' },
  USD: { rate: 0.012, symbol: '$', label: 'USD' },
  EUR: { rate: 0.011, symbol: '€', label: 'EUR' },
  GBP: { rate: 0.0095, symbol: '£', label: 'GBP' },
  AED: { rate: 0.044, symbol: 'AED ', label: 'AED' },
  SAR: { rate: 0.045, symbol: 'SAR ', label: 'SAR' },
  CAD: { rate: 0.016, symbol: 'CA$', label: 'CAD' },
  AUD: { rate: 0.018, symbol: 'AU$', label: 'AUD' }
};

export const FREE_DELIVERY_THRESHOLD = 1000; // in INR

export function CartProvider({ children, initialPath }) {
  const [cart, setCart] = useState([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [promoCode, setPromoCode] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [activePolicyTab, setActivePolicyTab] = useState(null);
  const [currentPath, setCurrentPath] = useState(() => (
    initialPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
  ));

  useEffect(() => {
    try {
      const saved = localStorage.getItem('desktop_buddy_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch (error) {
      console.error(error);
    }
    try {
      setPromoCode(localStorage.getItem('desktop_buddy_promo') || '');
    } catch (error) {
      console.error(error);
    }
    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openPolicy = (tab = 'shipping') => {
    setActivePolicyTab(tab);
  };

  const closePolicy = () => {
    setActivePolicyTab(null);
  };

  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      localStorage.setItem('desktop_buddy_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, hasLoadedStorage]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
  }, [isCartOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  };

  const addToCart = (product, variantTitle = 'Classic Blue') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.variant === variantTitle
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          type: product.type || 'Desktop Companion',
          variant: variantTitle,
          quantity: 1
        }
      ];
    });
    showToast(`Added ${product.title} to cart`);
    setIsCartOpen(true);
  };

  const updateQuantity = (id, variant, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id && item.variant === variant) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (id, variant) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.variant === variant)));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromoCode = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SPELLBUDDY' || clean === 'DESKTOPBUDDY') {
      setPromoCode(clean);
      try {
        localStorage.setItem('desktop_buddy_promo', clean);
      } catch {}
      showToast('🎉 Promo code applied! Free delivery unlocked!');
      return true;
    }
    showToast('Invalid promo code');
    return false;
  };

  const formatPrice = (priceInINR) => {
    const cur = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
    const converted = Math.round(priceInINR * cur.rate);
    if (currency === 'INR') {
      return `${cur.symbol}${converted.toLocaleString('en-IN')}`;
    }
    return `${cur.symbol}${converted.toFixed(2)}`;
  };

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalINR = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeDelivery = promoCode !== '' || subtotalINR >= FREE_DELIVERY_THRESHOLD;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        currency,
        setCurrency,
        formatPrice,
        promoCode,
        applyPromoCode,
        toastMessage,
        toastVisible,
        showToast,
        totalItemCount,
        subtotalINR,
        isFreeDelivery,
        selectedProductForModal,
        openColorModal: (prod) => setSelectedProductForModal(prod),
        closeColorModal: () => setSelectedProductForModal(null),
        activePolicyTab,
        setActivePolicyTab,
        openPolicy,
        closePolicy,
        currentPath,
        navigate
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
