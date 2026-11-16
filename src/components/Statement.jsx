import React, { useEffect, useState } from 'react';

export default function Statement() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="shopify-section section-statement">
      <div className="stack">
        <section className="drop" data-theme="red">
          <div
            className="render render--drop"
            style={{
              transform: `translate(0, ${scrollY * -0.08}px) rotate(${16 + scrollY * 0.005}deg)`
            }}
          >
            <img
              src="/assets/keycap-d-filled-render.webp?v=4"
              width="1600"
              height="1600"
              alt="Desktop Buddy Red 'D' Keycap"
              loading="lazy"
            />
          </div>
        </section>

        <section className="plug" data-theme="red">
          <h2 className="statement plug__text animate-in">
            <span className="ln"><span>Stand</span></span>
            <span className="ln"><span>out in</span></span>
            <span className="ln"><span>public.</span></span>
          </h2>
          <p className="plug__note">
            Your everyday tech doesn't have to be boring. Ours has a personality, and so do you.
          </p>
        </section>
      </div>
    </div>
  );
}
