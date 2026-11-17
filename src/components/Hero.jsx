import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Hero() {
  const { openColorModal } = useCart();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const defaultProduct = {
    id: 'desktop-buddy-main',
    title: 'YUYK / pre-order.',
    price: 750,
    originalPrice: 999,
    image: '/assets/desktop-buddy-main.jpg',
    type: 'Tactile Desktop Pet'
  };

  return (
    <div className="shopify-section section-hero">
      <div className="stack">
        <section className="hero" data-theme="ivory">
          {/* Floating 3D keycap */}
          <div
            className="render render--a"
            style={{
              transform: `translate(0, ${scrollY * -0.15}px) rotate(${28 + scrollY * 0.012}deg)`
            }}
          >
            <img
              src="/assets/keycap-d-colored-render.webp?v=4"
              width="1600"
              height="1600"
              alt="YUYK keycap"
              fetchpriority="high"
            />
          </div>

          {/* Kinetic Statement Typography */}
          <h1 className="statement hero__text animate-in">
            <span className="ln"><span>Tech</span></span>
            <span className="ln"><span>with</span></span>
            <span className="ln"><span>perso-</span></span>
            <span className="ln"><span>nality.</span></span>
          </h1>

          {/* Buy Callout */}
          <div className="hero__buy">
            <p className="hero__sub">
              YUYK makes everyday devices fun to use, and makes sure you stand out in public.
            </p>

            <div className="hero__ctas">
              <button
                className="btn btn--lg"
                onClick={() => openColorModal(defaultProduct)}
              >
                Shop YUYK
              </button>
              <a className="btn btn--lg btn--ghost" href="#shop">
                Shop all
              </a>
            </div>
          </div>

          {/* Floating Keycap B */}
          <div
            className="render render--b"
            style={{
              transform: `translate(0, ${scrollY * -0.22}px) rotate(${-14 - scrollY * 0.01}deg)`
            }}
          >
            <img
              src="/assets/keycap-filled-render.webp"
              width="1600"
              height="1600"
              alt="YUYK mechanical key"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
