import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function StickyCta() {
  const { isCartOpen, formatPrice, openColorModal } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const nearFooter = scrollPos + windowHeight > docHeight - 350;

      setIsVisible(scrollPos > windowHeight * 0.5 && !nearFooter);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultProduct = {
    id: 'desktop-buddy-main',
    title: 'Desktop Buddy / pre-order.',
    price: 750,
    originalPrice: 999,
    image: '/assets/desktop-buddy-main.jpg',
    type: 'Desktop Pet'
  };

  if (isCartOpen) return null;

  return (
    <div className={`sticky-cta ${isVisible ? 'is-on' : ''}`}>
      <img
        src="/assets/desktop-buddy-main.jpg"
        alt="Desktop Buddy"
        width="44"
        height="44"
        className="sticky-cta__img"
      />
      <div className="sticky-cta__text">
        <b>Desktop Buddy / pre-order.</b>
        <span>{formatPrice(750)}</span>
      </div>
      <button
        className="btn"
        onClick={() => openColorModal(defaultProduct)}
      >
        Shop Buddy
      </button>
    </div>
  );
}
