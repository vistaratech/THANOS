import React from 'react';
import { useCart, CURRENCY_RATES } from '../context/CartContext';

export default function Footer() {
  const { currency, setCurrency, openPolicy } = useCart();

  return (
    <div className="shopify-section section-footer">
      <footer className="footer" data-theme="ivory">
        {/* Infinite Running Marquee */}
        <div className="footer__marquee" aria-hidden="true">
          <div className="footer__track">
            <span className="statement" style={{ fontSize: '6vw', letterSpacing: '-0.02em' }}>
              YUYK
            </span>
            <img src="/assets/mascot-1.svg?v=2" alt="" className="footer__guy" width="120" height="107" loading="lazy" />
            <span className="statement" style={{ fontSize: '6vw', letterSpacing: '-0.02em', color: 'var(--red)' }}>
              CLICKY &amp; TACTILE
            </span>
            <img src="/assets/mascot-3.svg?v=2" alt="" className="footer__guy" width="120" height="107" loading="lazy" />
            <span className="statement" style={{ fontSize: '6vw', letterSpacing: '-0.02em' }}>
              YUYK
            </span>
            <img src="/assets/mascot-1.svg?v=2" alt="" className="footer__guy" width="120" height="107" loading="lazy" />
            <span className="statement" style={{ fontSize: '6vw', letterSpacing: '-0.02em', color: 'var(--blue)' }}>
              MADE IN ERODE
            </span>
            <img src="/assets/mascot-3.svg?v=2" alt="" className="footer__guy" width="120" height="107" loading="lazy" />
          </div>
        </div>

        {/* Footer Navigation Grid */}
        <div className="footer__grid">
          <div>
            <p>YUYK gives your everyday tech some personality. Designed with love in Tamil Nadu.</p>
          </div>

          <div>
            <h3>Shop</h3>
            <ul>
              <li><a href="/#shop">Shop all</a></li>
              <li><a href="/#spotlight">YUYK</a></li>
              <li><a href="/#merch">Merch</a></li>
              <li><a href="/#about">About</a></li>
            </ul>
          </div>

          <div>
            <h3>Help</h3>
            <ul>
              <li>
                <a href="/shipping" target="_blank" rel="noreferrer">
                  Delivery
                </a>
              </li>
              <li>
                <a href="/returns" target="_blank" rel="noreferrer">
                  Returns
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    const el = document.getElementById('contact');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3>Policies</h3>
            <ul>
              <li>
                <a href="/refund" target="_blank" rel="noreferrer">
                  Refund policy
                </a>
              </li>
              <li>
                <a href="/shipping" target="_blank" rel="noreferrer">
                  Shipping policy
                </a>
              </li>
              <li>
                <a href="/privacy" target="_blank" rel="noreferrer">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="/terms" target="_blank" rel="noreferrer">
                  Terms &amp; conditions
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__contact" id="contact">
            <h3>Contact Us</h3>
            <ul>
              <li>
                <a href="mailto:contact.yuyk@gmail.com">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <rect x="3" y="5.5" width="18" height="13" rx="2" />
                    <path d="m3.5 7 8.5 6 8.5-6" />
                  </svg>
                  contact.yuyk@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+918883388365">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />
                  </svg>
                  +91 88833 88365
                </a>
              </li>
              <li>
                <address>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
                    <circle cx="12" cy="10" r="2.3" />
                  </svg>
                  <span>Vijayamangalam, Perundurai, Erode, Tamil Nadu 638056, India</span>
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="footer__legal">
          <span>&copy; 2026 YUYK</span>
          <span>Give your tech some personality</span>
          <span className="footer__cur">
            Prices in{' '}
            <label className="cur">
              <span className="sr-only">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Show prices in"
              >
                {Object.keys(CURRENCY_RATES).map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </label>
          </span>
        </div>

        {/* Agency / Developer Credits */}
        <div className="footer__credits">
          <p>
            App powered by <b>exceptionz &times; Vistara Tech</b>. If you need an app or website like this, contact{' '}
            <a href="mailto:exceptionz13@gmail.com">exceptionz13@gmail.com</a> or{' '}
            <a href="mailto:info.vistaratech@gmail.com">info.vistaratech@gmail.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
