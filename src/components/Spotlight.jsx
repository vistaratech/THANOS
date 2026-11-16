import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const GALLERY = [
  {
    src: '/assets/desktop-buddy-main.jpg',
    label: 'Happy ^_^',
    alt: 'Desktop Buddy orange cube robot smiling face on desk'
  },
  {
    src: '/assets/desktop-buddy-wink.jpg',
    label: 'Wink O_<',
    alt: 'Desktop Buddy winking face'
  }
];

export default function Spotlight() {
  const { formatPrice, openColorModal } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const product = {
    id: 'desktop-buddy-main',
    title: 'Desktop Buddy / pre-order.',
    price: 750,
    originalPrice: 999,
    image: GALLERY[activeImageIndex].src,
    type: 'Tactile Desktop Pet'
  };

  return (
    <div id="spotlight" className="shopify-section section-spotlight">
      <section className="spot" data-theme="ivory" aria-label="Spotlight Product">
        <div className="spot__media reveal is-in">
          <div
            style={{ cursor: 'pointer', overflow: 'hidden', borderRadius: '24px', position: 'relative' }}
            onClick={() => openColorModal(product)}
          >
            <img
              src={GALLERY[activeImageIndex].src}
              alt={GALLERY[activeImageIndex].alt}
              width="1200"
              height="1200"
              style={{ width: '100%', height: 'auto', display: 'block', transition: 'all 0.3s ease' }}
            />
            <span className="pcard__badge">New · Batch 1</span>
          </div>

          {/* Mini Expression Selector Gallery */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', justifyContent: 'center' }}>
            {GALLERY.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  padding: 0,
                  border: activeImageIndex === idx ? '2.5px solid var(--ink)' : '1px solid rgba(20,20,20,0.18)',
                  cursor: 'pointer',
                  opacity: activeImageIndex === idx ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                  background: '#fff'
                }}
                title={img.label}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="spot__info reveal is-in">
          <p className="eyebrow">
            <span className="dot"></span>Just launched · Made in Erode
          </p>
          <h2 className="statement spot__name">
            Desktop Buddy / pre-order.
          </h2>
          <p className="spot__tagline">
            The expressive desktop pet that gives your workspace some personality. Features multiple animated pixel faces, chunky tactile feel, and mood expressions.
          </p>
          <p className="price">
            {formatPrice(product.price)}
            {product.originalPrice && (
              <s className="pcard__was" style={{ marginLeft: '10px', color: 'var(--soft)' }}>
                {formatPrice(product.originalPrice)}
              </s>
            )}
            <small>Direct WhatsApp Order · Erode Dispatch</small>
          </p>
          <div className="spot__actions">
            <button
              className="btn btn--lg spot__cta"
              onClick={() => openColorModal(product)}
            >
              Shop now <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
