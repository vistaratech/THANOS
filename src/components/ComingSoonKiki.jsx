import React from 'react';

export default function ComingSoonKiki() {
  return (
    <div className="shopify-section section-soon">
      <section className="soon" data-theme="ink" aria-label="Upcoming companion Kiki">
        <div>
          <p className="eyebrow">Coming soon</p>
          <h2 className="statement soon__title">
            Next up:<br />
            Kiki.
          </h2>
          <p className="soon__copy">
            A tiny digital buddy designed to travel with you everyday. We'll show you more when she's ready.
          </p>
        </div>

        <div className="soon__media">
          <img
            src="/assets/kiki-cutout.webp"
            width="1600"
            height="1600"
            alt="Kiki digital companion preview"
            loading="lazy"
          />
          <span className="pcard__soon">Coming soon</span>
        </div>
      </section>
    </div>
  );
}
