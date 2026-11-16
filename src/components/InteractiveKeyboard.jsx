import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { playKeyClick } from '../utils/sound';
import { useCart } from '../context/CartContext';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const COLORS = ['var(--amber)', 'var(--ivory)', '#8fb8ff', '#f2b8b2'];

export default function InteractiveKeyboard() {
  const { applyPromoCode, openColorModal } = useCart();
  const [pressedKeys, setPressedKeys] = useState({});
  const [foundLetters, setFoundLetters] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const bufferRef = useRef('');

  const secretCode = 'SPELLBUDDY';

  const pressKey = (ch) => {
    ch = ch.toUpperCase();
    playKeyClick(300 + ch.charCodeAt(0) * 3);

    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isRed = Math.random() < 0.25;

    setPressedKeys((prev) => ({
      ...prev,
      [ch]: {
        down: true,
        lit: true,
        isRed,
        color: randomColor
      }
    }));

    setTimeout(() => {
      setPressedKeys((prev) => ({
        ...prev,
        [ch]: {
          ...prev[ch],
          down: false
        }
      }));
    }, 120);

    setTimeout(() => {
      setPressedKeys((prev) => ({
        ...prev,
        [ch]: {
          ...prev[ch],
          lit: false
        }
      }));
    }, 800);

    bufferRef.current = (bufferRef.current + ch).slice(-5);

    if (bufferRef.current.endsWith('BUDDY') && !unlocked) {
      setUnlocked(true);
      setFoundLetters(['B', 'U', 'D', 'Y']);
      applyPromoCode(secretCode);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ED4027', '#FEB31D', '#154586', '#FEF5E1']
        });
      } catch (e) {}
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        pressKey(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unlocked]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(secretCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const defaultProduct = {
    id: 'desktop-buddy-main',
    title: 'Desktop Buddy / pre-order.',
    price: 750,
    originalPrice: 999,
    image: '/assets/desktop-buddy-main.jpg',
    type: 'Desktop Pet'
  };

  return (
    <div className="shopify-section section-keyboard">
      <section className="board" data-theme="blue" aria-label="Playable mechanical keyboard">
        <div className="keyboard" role="group" aria-label="A playable keyboard">
          {ROWS.map((row, rIdx) => (
            <div key={rIdx} className="keyboard__row">
              {row.split('').map((ch) => {
                const keyState = pressedKeys[ch] || {};
                const isFound = foundLetters.includes(ch);

                let keyClasses = 'key';
                if (keyState.down) keyClasses += ' is-down';
                if (keyState.lit) keyClasses += ' is-lit';
                if (keyState.isRed) keyClasses += ' is-red';
                if (isFound) keyClasses += ' is-found';

                return (
                  <button
                    key={ch}
                    type="button"
                    className={keyClasses}
                    style={{ '--c': keyState.color || 'var(--amber)' }}
                    aria-label={ch}
                    onPointerDown={() => pressKey(ch)}
                  >
                    <span className="key__face" aria-hidden="true">
                      {ch.toLowerCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="board__foot">
          <h2 className="statement board__title">Type it in.</h2>
          <p className="board__hint">
            Spell <span className="kbd">buddy</span> to unlock <b>free delivery</b> on your order.
          </p>

          <button
            className="btn btn--lg btn--light"
            onClick={() => openColorModal(defaultProduct)}
          >
            Shop Desktop Buddy
          </button>

          {unlocked && (
            <div className="reward">
              <span className="reward__title">You found it! Free delivery on your order.</span>
              <span className="reward__row">
                <code className="reward__code">{secretCode}</code>
                <button type="button" className="reward__copy" onClick={handleCopyCode}>
                  {copied ? 'Copied ✓' : 'Copy code'}
                </button>
              </span>
              <span className="reward__note">Applied automatically at checkout!</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
