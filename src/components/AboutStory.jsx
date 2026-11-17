import React, { useEffect, useRef, useState } from 'react';

const PARAGRAPHS = [
  'Most tech is designed to disappear. Ours is designed to be noticed: chunky enough to hold, press and click, colourful because colour is a feature, and a little bit weird, because the best objects have a personality.',
  'We make devices that make you stand out in public. Put one on your desk and watch people ask about it.',
  'YUYK is the first. More are on the way.'
];

export default function AboutStory() {
  const containerRef = useRef(null);
  const [activeWordCount, setActiveWordCount] = useState(0);

  // Flatten all words
  const allWords = PARAGRAPHS.flatMap((p) => p.split(/\s+/));
  const totalWords = allWords.length;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress through this section
      const progress = Math.min(
        1,
        Math.max(0, (windowHeight * 0.8 - rect.top) / (rect.height * 0.85))
      );
      const count = Math.round(progress * totalWords);
      setActiveWordCount(count);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalWords]);

  let wordIndexCounter = 0;

  return (
    <div id="about" className="shopify-section section-story">
      <section ref={containerRef} className="info" data-theme="ivory">
        <p className="info__lead">YUYK makes typical devices fun to use.</p>

        {PARAGRAPHS.map((paragraph, pIdx) => {
          const words = paragraph.split(/\s+/);
          return (
            <p key={pIdx}>
              {words.map((word, wIdx) => {
                const currentIndex = wordIndexCounter++;
                const isLit = currentIndex < activeWordCount;
                return (
                  <span
                    key={wIdx}
                    className={`word ${isLit ? 'on' : ''}`}
                    style={{ marginRight: '0.28em' }}
                  >
                    {word}
                  </span>
                );
              })}
            </p>
          );
        })}
      </section>
    </div>
  );
}
