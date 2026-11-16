import React from 'react';
import { useCart } from '../context/CartContext';

export default function ShopProducts() {
  const { formatPrice, openColorModal } = useCart();

  const products = [
    {
      id: 'desktop-buddy-main',
      title: 'Desktop Buddy / pre-order.',
      price: 750,
      originalPrice: 999,
      image: '/assets/desktop-buddy-main.jpg',
      altImage: '/assets/desktop-buddy-wink.jpg',
      type: 'Desktop Pet · Cyber Orange'
    },
    {
      id: 'desktop-buddy-expressions',
      title: 'Desktop Buddy / Expressive Edition.',
      price: 750,
      originalPrice: 999,
      image: '/assets/desktop-buddy-main.jpg',
      altImage: '/assets/desktop-buddy-wink.jpg',
      type: 'Desktop Pet · 4 Animated Moods'
    }
  ];

  return (
    <div id="shop" className="shopify-section section-products">
      <section className="section" data-theme="ivory" aria-label="Shop Desktop Buddy">
        <header className="section__head">
          <div>
            <h2 className="statement section__title">Shop Desktop Buddy</h2>
          </div>
          <a className="section__link" href="#shop">
            Pre-order Batch 1 &rarr;
          </a>
        </header>

        <div className="products" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {products.map((product) => (
            <article key={product.id} className="pcard pcard--wide">
              <div
                className="pcard__media"
                onClick={() => openColorModal(product)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  width="900"
                  height="900"
                  loading="lazy"
                />
                <img
                  src={product.altImage}
                  alt={product.title}
                  width="900"
                  height="900"
                  loading="lazy"
                  className="pcard__alt"
                />
                <span className="pcard__badge">In Stock</span>
              </div>

              <div className="pcard__body">
                <div>
                  <h3 className="pcard__name">
                    <a
                      href="#spotlight"
                      onClick={(e) => {
                        e.preventDefault();
                        openColorModal(product);
                      }}
                    >
                      {product.title}
                    </a>
                  </h3>
                  <p className="pcard__type">{product.type}</p>
                </div>

                <p className="pcard__price">
                  From {formatPrice(product.price)}
                  <s className="pcard__was">{formatPrice(product.originalPrice)}</s>
                </p>
              </div>

              <button
                className="pcard__add"
                onClick={() => openColorModal(product)}
              >
                Choose colour &amp; Order
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
