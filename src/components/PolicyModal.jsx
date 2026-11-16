import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

const POLICIES_DATA = {
  shipping: {
    id: 'shipping',
    badge: 'Fast Pan-India Dispatch',
    title: 'Delivery & Shipping Policy',
    intro: 'Every Desktop Buddy is assembled and tested with care in Vijayamangalam, Perundurai, Erode. Here is everything you need to know about delivery.',
    sections: [
      {
        heading: 'Shipping Rates & Free Delivery',
        content: [
          'Orders ₹1,000 and above: FREE Delivery across India.',
          'Orders below ₹1,000: Flat ₹50 delivery charge.',
          'Secret Perk: Use promo code SPELLBUDDY on the keyboard to unlock FREE delivery on any order!'
        ]
      },
      {
        heading: 'Estimated Delivery Timelines',
        content: [
          'Tamil Nadu & Neighboring States: 2 to 4 business days.',
          'Metro Cities (Bengaluru, Chennai, Mumbai, Delhi, Hyderabad): 3 to 5 business days.',
          'Rest of India: 4 to 7 business days.',
          'Dispatched via verified courier partners including Blue Dart, Delhivery, DTDC, and India Post Speed Post.'
        ]
      },
      {
        heading: 'Order Tracking',
        content: [
          'Once your Desktop Buddy is packaged and dispatched from our Erode studio, our team will send your tracking ID and live tracking link directly to your WhatsApp (+91 88833 88365).',
          'You can message our WhatsApp number anytime to get instant live status updates on your parcel.'
        ]
      }
    ]
  },
  returns: {
    id: 'returns',
    badge: '100% Risk-Free Guarantee',
    title: '7-Day Hassle-Free Returns',
    intro: 'We want you to love your Desktop Buddy. If anything is not 100% right, our 7-day return and exchange policy has you covered.',
    sections: [
      {
        heading: '7-Day Return Window',
        content: [
          'You have 7 full calendar days from the date of delivery to request an exchange, replacement, or return.',
          'Applicable if your Desktop Buddy arrives damaged, has a switch defect, or if you received an incorrect color variant.'
        ]
      },
      {
        heading: 'How to Initiate a Return',
        content: [
          'Step 1: Open WhatsApp and send a message to +91 88833 88365, or email hello@desktopbuddy.tech.',
          'Step 2: Share your order name and a quick photo/video of the issue.',
          'Step 3: Our team will verify and dispatch a free replacement or initiate reverse pickup immediately — no arguments, no hassle.'
        ]
      },
      {
        heading: 'Condition Requirements',
        content: [
          'The item should be in original physical condition with all keycaps and packaging intact.',
          'Normal wear and tear from weeks of clicky usage is not covered, but initial mechanical defects are 100% replaced free.'
        ]
      }
    ]
  },
  refund: {
    id: 'refund',
    badge: 'Fast 24-48h Processing',
    title: 'Refund Policy',
    intro: 'Clear, transparent refunds without unnecessary waiting periods.',
    sections: [
      {
        heading: 'Cancellation Before Dispatch',
        content: [
          'Need to cancel your order before it ships? Message our team on WhatsApp (+91 88833 88365) anytime before dispatch for an immediate, full 100% cancellation and refund.'
        ]
      },
      {
        heading: 'Refund Process for Returns',
        content: [
          'Once an approved return arrives back at our Vijayamangalam hub and is verified, refunds are initiated within 24 to 48 hours.',
          'For Cash on Delivery / WhatsApp orders: Refunds are sent directly to your UPI ID (Google Pay, PhonePe, Paytm) or bank account.',
          'For Online Payments: The amount is reversed back to your original payment method within 3–5 working days.'
        ]
      },
      {
        heading: 'Non-Refundable Items',
        content: [
          'Products damaged due to customer misuse, liquid exposure, or unauthorized disassembly cannot be refunded.'
        ]
      }
    ]
  },
  privacy: {
    id: 'privacy',
    badge: 'Zero Spam · 100% Secure',
    title: 'Privacy Policy',
    intro: 'Your trust is our top priority. We only collect the bare minimum details required to deliver your Desktop Buddy.',
    sections: [
      {
        heading: 'Information We Collect',
        content: [
          'Customer Name: To address your parcel correctly.',
          'WhatsApp / Mobile Number: To send your order confirmation and dispatch tracking link.',
          'Delivery Address & Pincode: Strictly for shipping your package via our courier partners.'
        ]
      },
      {
        heading: 'How We Protect Your Data',
        content: [
          'We NEVER sell, trade, or share your contact details with telemarketers, third-party advertisers, or spam networks.',
          'Your information is solely shared with the courier delivery partner responsible for delivering your package.',
          'We do not send promotional spam. You will only receive messages concerning your order status.'
        ]
      },
      {
        heading: 'Data Deletion Requests',
        content: [
          'You may request complete removal of your phone number and address from our records anytime by messaging hello@desktopbuddy.tech or WhatsApp (+91 88833 88365).'
        ]
      }
    ]
  },
  terms: {
    id: 'terms',
    badge: 'Official Terms',
    title: 'Terms & Conditions',
    intro: 'Please review the standard terms of using Desktop Buddy and ordering our products.',
    sections: [
      {
        heading: 'Store Information',
        content: [
          'Desktop Buddy is an independent designer brand based in Vijayamangalam, Perundurai, Erode, Tamil Nadu 638056, India.',
          'Our products are designed as tactile mechanical desktop pets and fidget companions.'
        ]
      },
      {
        heading: 'Pricing & Availability',
        content: [
          'All product prices are quoted in Indian Rupees (INR ₹) and are inclusive of all applicable taxes.',
          'Product availability, pre-order timelines, and introductory prices (e.g. ₹750) are subject to batch stock limits.'
        ]
      },
      {
        heading: 'Order Placement & WhatsApp Agreement',
        content: [
          'Orders initiated through the WhatsApp order form are verified directly by our customer team before dispatch.',
          'Desktop Buddy reserves the right to cancel or pause orders in unserviceable pincodes with full notification to the customer.'
        ]
      },
      {
        heading: 'Governing Law',
        content: [
          'These terms and any contracts formed shall be governed by and construed in accordance with the laws of India, under the jurisdiction of the courts in Erode, Tamil Nadu.'
        ]
      }
    ]
  }
};

const TABS = [
  { id: 'shipping', label: 'Delivery & Shipping', icon: '🚚' },
  { id: 'returns', label: '7-Day Returns', icon: '🔄' },
  { id: 'refund', label: 'Refund Policy', icon: '💰' },
  { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
  { id: 'terms', label: 'Terms & Conditions', icon: '📜' }
];

export default function PolicyModal() {
  const { activePolicyTab, setActivePolicyTab, closePolicy } = useCart();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closePolicy();
    };
    if (activePolicyTab) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activePolicyTab, closePolicy]);

  if (!activePolicyTab) return null;

  const currentPolicy = POLICIES_DATA[activePolicyTab] || POLICIES_DATA.shipping;

  return (
    <div className="modal-overlay policy-overlay" onClick={closePolicy} role="dialog" aria-modal="true">
      <div className="policy-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <header className="policy-modal-header">
          <div className="policy-modal-title-group">
            <span className="pcard__badge" style={{ position: 'static', margin: 0 }}>
              Help &amp; Policies
            </span>
            <h3>Desktop Buddy Info Center</h3>
          </div>
          <button className="icon-btn" onClick={closePolicy} aria-label="Close modal">
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" style={{ width: '18px', height: '18px' }}>
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Modal Layout */}
        <div className="policy-modal-body">
          {/* Navigation Sidebar */}
          <nav className="policy-nav-tabs" aria-label="Policy Navigation">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`policy-tab-btn ${activePolicyTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActivePolicyTab(tab.id)}
              >
                <span className="policy-tab-icon">{tab.icon}</span>
                <span className="policy-tab-text">{tab.label}</span>
              </button>
            ))}

            <div className="policy-nav-contact">
              <b>Need quick help?</b>
              <p>Chat directly with our Vijayamangalam studio team.</p>
              <a
                href="https://wa.me/918883388365?text=Hi%20Desktop%20Buddy!%20I%20have%20a%20question%20about%20my%20order."
                target="_blank"
                rel="noreferrer"
                className="btn btn--sm wa-btn"
                style={{ width: '100%', padding: '8px 12px', fontSize: '12px' }}
              >
                WhatsApp +91 88833 88365
              </a>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="policy-content-area">
            <span className="policy-badge">{currentPolicy.badge}</span>
            <h2 className="statement policy-title">{currentPolicy.title}</h2>
            <p className="policy-intro">{currentPolicy.intro}</p>

            <div className="policy-sections">
              {currentPolicy.sections.map((sec, idx) => (
                <div key={idx} className="policy-card">
                  <h4>{sec.heading}</h4>
                  <ul>
                    {sec.content.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer notice inside policy */}
            <div className="policy-footer-note">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
                <circle cx="12" cy="10" r="2.3" />
              </svg>
              <span>
                Dispatched with care from Vijayamangalam, Perundurai, Erode, Tamil Nadu 638056, India.
                For inquiries: <a href="mailto:hello@desktopbuddy.tech">hello@desktopbuddy.tech</a>
              </span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
