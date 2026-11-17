import React from 'react';

const MERCH_ITEMS = [
  {
    title: 'YUYK Mascot Tee',
    type: 'Merch',
    image: '/assets/merch-tee-front.webp?v=2',
    alt: 'White tee with an embroidered robot mascot on the chest'
  },
  {
    title: 'YUYK Cap',
    type: 'Merch',
    image: '/assets/merch-cap.webp?v=2',
    alt: 'YUYK 3D embroidered cap in cosmonaut blue'
  },
  {
    title: 'YUYK Statement Tee',
    type: 'Merch',
    image: '/assets/merch-tee-back.webp?v=2',
    alt: 'White tee with YUYK collegiate embroidery across the back'
  }
];

export default function MerchSection() {
  return (
    <div id="merch" className="shopify-section section-products">
      <section className="section section--tight" data-theme="ivory" aria-label="Merchandise">
        <header className="section__head">
          <div>
            <p className="eyebrow">
              <span className="dot"></span>Coming soon
            </p>
            <h2 className="statement section__title">Merch</h2>
          </div>
          <a className="section__link" href="#merch">
            See all merch &rarr;
          </a>
        </header>

        <div className="products products--3">
          {MERCH_ITEMS.map((item, idx) => (
            <article key={idx} className="pcard pcard--soon pcard--clear">
              <div className="pcard__media">
                <img
                  src={item.image}
                  alt={item.alt}
                  width="900"
                  height="1195"
                  loading="lazy"
                />
                <span className="pcard__soon">Coming soon</span>
              </div>
              <div className="pcard__body">
                <div>
                  <h3 className="pcard__name">{item.title}</h3>
                  <p className="pcard__type">{item.type}</p>
                </div>
                <p className="pcard__price pcard__price--soon">Coming soon</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
