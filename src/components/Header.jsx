import React, { useState, useEffect } from 'react';
import { useCart, CURRENCY_RATES } from '../context/CartContext';

export default function Header() {
  const { totalItemCount, openCart, currency, setCurrency, openColorModal } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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
    type: 'Tactile Desktop Pet'
  };

  return (
    <div className="section-header">
      <header className={`header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="header__inner">
          <nav className="header__nav" aria-label="Main">
            <a href="#shop">Shop all</a>
            <a href="#spotlight">Desktop Buddy</a>
            <a href="#merch">Merch</a>
            <a href="#about">About</a>
          </nav>

          <button
            className="header__menu icon-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              {isMenuOpen ? (
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" />
              ) : (
                <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="2" />
              )}
            </svg>
          </button>

          <a className="header__logo" href="/" aria-label="Desktop Buddy home">
            <span>Desktop Buddy</span>
            <span className="logo-dot"></span>
          </a>

          <div className="header__end">
            <label className="cur header__cur">
              <span className="sr-only">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Show prices in"
              >
                {Object.keys(CURRENCY_RATES).map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="btn btn--sm header__shop"
              onClick={() => openColorModal(defaultProduct)}
            >
              Shop Buddy
            </button>

            <button
              className="cart-btn"
              onClick={openCart}
              aria-label="Open cart"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M4.5 7h11l-1 10.5h-9z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M7.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              {totalItemCount > 0 && (
                <span className="cart-btn__count">{totalItemCount}</span>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="menu" aria-label="Mobile">
            <a href="#shop" onClick={() => setIsMenuOpen(false)}>Shop all</a>
            <a href="#spotlight" onClick={() => setIsMenuOpen(false)}>Desktop Buddy</a>
            <a href="#merch" onClick={() => setIsMenuOpen(false)}>Merch</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
          </nav>
        )}
      </header>
    </div>
  );
}
