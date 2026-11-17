import React from 'react';
import { useCart } from '../context/CartContext';

export default function Perks() {
  const { openPolicy } = useCart();

  return (
    <div className="shopify-section section-perks">
      <section className="perks" aria-label="Why shop with YUYK">
        <ul>
          <li style={{ cursor: 'pointer' }} onClick={() => openPolicy('shipping')} title="View Delivery Policy">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M2 6h11v9H2zM13 9h4l3 3v3h-7" />
              <circle cx="6" cy="17.5" r="1.8" />
              <circle cx="17" cy="17.5" r="1.8" />
            </svg>
            <div>
              <b>Free delivery over ₹1,000</b>
              <span>A small delivery fee applies below that</span>
            </div>
          </li>

          <li>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="2.5" y="6" width="19" height="12" rx="2" />
              <circle cx="12" cy="12" r="2.6" />
              <path d="M6 9.5v5M18 9.5v5" />
            </svg>
            <div>
              <b>Cash on delivery</b>
              <span>Pay when it arrives at your door</span>
            </div>
          </li>

          <li style={{ cursor: 'pointer' }} onClick={() => openPolicy('returns')} title="View 7-Day Return Policy">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 7 4 12l5 5" />
              <path d="M4 12h11a5 5 0 0 1 0 10h-2" />
            </svg>
            <div>
              <b>7-day returns</b>
              <span>Easy, no-fuss return policy</span>
            </div>
          </li>

          <li style={{ cursor: 'pointer' }} onClick={() => openPolicy('shipping')} title="View Dispatch Details">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <div>
              <b>Dispatched from Erode</b>
              <span>Fast 4–7 days pan-India delivery</span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
