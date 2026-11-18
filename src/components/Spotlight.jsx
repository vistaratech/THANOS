import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

const GALLERY = [
  {
    src: '/assets/yuyk-expression-happy.webp',
    label: 'Happy'
  },
  {
    src: '/assets/yuyk-expression-cool.webp',
    label: 'Cool'
  },
  {
    src: '/assets/yuyk-expression-angry.webp',
    label: 'Angry'
  },
  {
    src: '/assets/yuyk-expression-sleepy.webp',
    label: 'Sleepy'
  }
];

export default function Spotlight() {
  const { formatPrice, openColorModal } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsPlaying(!motionPreference.matches);

    const handleMotionPreferenceChange = () => {
      setIsPlaying(!motionPreference.matches);
    };
    motionPreference.addEventListener('change', handleMotionPreferenceChange);
    return () => motionPreference.removeEventListener('change', handleMotionPreferenceChange);
  }, []);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % GALLERY.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const product = {
    id: 'desktop-buddy-main',
    title: 'YUYK / pre-order.',
    price: 750,
    originalPrice: 999,
    image: '/assets/desktop-buddy-main.jpg',
    type: 'Tactile Desktop Pet'
  };

  return (
    <div id="spotlight" className="shopify-section section-spotlight">
      <section className="spot" data-theme="ivory" aria-label="Spotlight Product">
        <div className="spot__media reveal is-in">
          <button
            type="button"
            className="spot__image-stage"
            aria-label={`Choose YUYK, showing the ${GALLERY[activeImageIndex].label} expression`}
            onClick={() => openColorModal(product)}
          >
            {GALLERY.map((image, idx) => (
              <img
                key={image.label}
                className={idx === activeImageIndex ? 'is-active' : ''}
                src={image.src}
                alt={idx === activeImageIndex ? `YUYK ${image.label.toLowerCase()} expression` : ''}
                aria-hidden={idx !== activeImageIndex}
                width="1200"
                height="1200"
              />
            ))}
            <span className="pcard__badge">New · Batch 1</span>
          </button>

          {/* Mini Expression Selector Gallery */}
          <div className="spot__gallery-controls">
            {GALLERY.map((img, idx) => (
              <button
                key={img.label}
                type="button"
                className={`spot__expression-thumb ${activeImageIndex === idx ? 'is-active' : ''}`}
                aria-label={`Show ${img.label.toLowerCase()} expression`}
                aria-pressed={activeImageIndex === idx}
                onClick={() => {
                  setActiveImageIndex(idx);
                  setIsPlaying(false);
                }}
              >
                <img src={img.src} alt="" width="64" height="64" />
              </button>
            ))}
            <button
              type="button"
              className="spot__motion-toggle"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? 'Pause emotion animation' : 'Play emotion animation'}
              aria-pressed={isPlaying}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>

        <div className="spot__info reveal is-in">
          <p className="eyebrow">
            <span className="dot"></span>Just launched · Made in Erode
          </p>
          <h2 className="statement spot__name">
            YUYK Desktop Pet
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
