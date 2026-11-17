import React, { useEffect, useRef, useState } from 'react';

export default function Statement() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const dropRef = useRef(null);

  useEffect(() => {
    const updateScrollProgress = () => {
      const dropTop = dropRef.current.getBoundingClientRect().top + window.scrollY;
      const progress = window.scrollY + window.innerHeight - dropTop;
      setScrollProgress(Math.min(600, Math.max(0, progress)));
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div className="shopify-section section-statement">
      <div className="stack">
        <section ref={dropRef} className="drop" data-theme="red">
          <div
            className="render render--drop"
            style={{
              transform: `translate(0, ${scrollProgress * -0.15}px) rotate(${28 + scrollProgress * 0.012}deg)`
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
