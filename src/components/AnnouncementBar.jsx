import React, { useState, useEffect } from 'react';

const MESSAGES = [
  'Free delivery on orders over ₹1,000',
  'Cash on delivery available across India',
  'Desktop Buddy is here · Handcrafted in Vijayamangalam, Erode',
  'Easy 7-day hassle-free returns'
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announce" aria-label="Store news">
      <div className="announce__msgs">
        {MESSAGES.map((msg, i) => (
          <span key={i} className={i === index ? 'is-on' : ''}>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
