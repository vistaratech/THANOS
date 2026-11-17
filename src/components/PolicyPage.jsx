import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import AnnouncementBar from './AnnouncementBar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

const POLICIES = {
  shipping: {
    title: 'Delivery & Shipping Policy',
    badge: 'Pan-India Delivery',
    lastUpdated: 'November 2026',
    description: 'Everything you need to know about how your YUYK is packaged, dispatched, and delivered from our studio in Vijayamangalam, Erode.',
    sections: [
      {
        title: 'Dispatch Location & Crafting Time',
        content: [
          'Every YUYK is assembled, inspected, and tactile-tested by hand at our workshop in Vijayamangalam, Perundurai, Erode, Tamil Nadu 638056.',
          'Orders are packed and dispatched within 24 to 48 hours of order confirmation.'
        ]
      },
      {
        title: 'Delivery Timelines',
        content: [
          'Tamil Nadu & Neighboring States (Karnataka, Kerala, Andhra Pradesh): 2 to 4 business days.',
          'Major Metro Cities (Bengaluru, Chennai, Mumbai, Delhi, Hyderabad, Kolkata): 3 to 5 business days.',
          'Rest of India: 4 to 7 business days.',
          'We ship exclusively through trusted courier partners: Blue Dart, Delhivery, DTDC, and India Post Speed Post.'
        ]
      },
      {
        title: 'Shipping Rates & Free Delivery',
        content: [
          'Orders ₹1,000 and above qualify for 100% FREE Delivery across India.',
          'Orders below ₹1,000 have a nominal flat delivery charge of ₹50.',
          'Secret Perk: You can unlock FREE delivery on any order by solving the secret promo code SPELLBUDDY on our interactive mechanical keyboard!'
        ]
      },
      {
        title: 'Live Tracking on WhatsApp',
        content: [
          'Once your parcel is handed over to the courier, our team will send your tracking ID and real-time tracking link directly to your WhatsApp number (+91 88833 88365).',
          'You can reply to our WhatsApp message at any time to ask for live transit updates.'
        ]
      }
    ]
  },

  returns: {
    title: '7-Day Return & Exchange Policy',
    badge: '100% Risk-Free Guarantee',
    lastUpdated: 'November 2026',
    description: 'We take great pride in our tactile craftsmanship. If you are not completely satisfied with your YUYK, our 7-day hassle-free policy has you covered.',
    sections: [
      {
        title: '7-Day Return Window',
        content: [
          'You have 7 full calendar days from the date of package delivery to request an exchange, replacement, or return.',
          'Eligible situations include: damaged in transit, mechanical switch failure, defective keycap, or receiving the wrong color variant.'
        ]
      },
      {
        title: 'How to Initiate a Return',
        content: [
          '1. Message our team on WhatsApp at +91 88833 88365 or email contact.yuyk@gmail.com.',
          '2. Mention your customer name and attach a brief photo or video showing the defect or issue.',
          '3. Our Erode team will immediately approve a replacement or organize a reverse pickup. No complex forms or arguments.'
        ]
      },
      {
        title: 'Return Condition Guidelines',
        content: [
          'The product must be in its original physical condition with all keycaps and packaging components included.',
          'Normal wear from daily clicky fidgeting is not considered a defect, but any manufacturing flaw is 100% guaranteed.'
        ]
      }
    ]
  },

  refund: {
    title: 'Refund Policy',
    badge: 'Fast 24-48h Processing',
    lastUpdated: 'November 2026',
    description: 'We believe in prompt, transparent refunds without unnecessary waiting periods or hidden deductions.',
    sections: [
      {
        title: 'Cancellation Before Dispatch',
        content: [
          'If you change your mind before your package has shipped, message us on WhatsApp (+91 88833 88365) for an immediate 100% full cancellation and refund.'
        ]
      },
      {
        title: 'Refund Timelines for Returned Products',
        content: [
          'Once your returned YUYK arrives back at our hub in Vijayamangalam, Erode and is verified, your refund is approved within 24 hours.',
          'For WhatsApp & COD Orders: Refunds are sent instantly to your preferred UPI ID (Google Pay, PhonePe, Paytm) or bank account.',
          'For Pre-paid Orders: The amount is credited back to your original source account within 3 to 5 business days.'
        ]
      },
      {
        title: 'Exceptions',
        content: [
          'Items showing signs of intentional physical abuse, water submersion, or unauthorized disassembly are not eligible for a refund.'
        ]
      }
    ]
  },

  privacy: {
    title: 'Privacy Policy',
    badge: 'Your Privacy Matters',
    lastUpdated: 'November 2026',
    description: 'This Privacy Policy describes how YUYK collects, uses, and protects your information when you visit our store or order our products.',
    sections: [
      {
        title: 'Information We Collect',
        content: [
          'Customer Name: Used to address and label your parcel correctly.',
          'WhatsApp / Mobile Number: Used solely to send order verification, dispatch tracking links, and delivery coordination.',
          'Delivery Address & Pincode: Shared with our courier partners (Blue Dart, Delhivery, DTDC, India Post) to physically transport your package to your doorstep.',
          'Order items and customer notes: Stored with the order request in Neon Postgres, our database service provider, so authorized staff can manage and fulfill it.'
        ]
      },
      {
        title: 'How We Use Your Information',
        content: [
          'To process and fulfill your pre-order requests.',
          'To communicate real-time delivery status updates via WhatsApp.',
          'To handle return, exchange, or customer support queries.',
          'Order details are stored in our Neon database for order administration and are not used for advertising.',
          'We DO NOT sell, rent, lease, or monetize your contact details with external third-party marketing companies, advertisers, or call centers.'
        ]
      },
      {
        title: 'Data Security & Storage',
        content: [
          'All communication conducted through our official WhatsApp (+91 88833 88365) is protected by WhatsApp end-to-end encryption.',
          'Checkout details are stored in Neon Postgres and can be accessed by authorized administrators through the protected order dashboard. WhatsApp receives the order message only when you choose to send it.',
          'We do not store credit card or debit card numbers on our servers.'
        ]
      },
      {
        title: 'Your Rights & Data Deletion',
        content: [
          'You may request complete erasure of your contact details from our records at any time by messaging contact.yuyk@gmail.com or WhatsApp (+91 88833 88365).'
        ]
      }
    ]
  },

  terms: {
    title: 'Terms & Conditions',
    badge: 'Official Terms of Service',
    lastUpdated: 'November 2026',
    description: 'These terms and conditions govern your use of the YUYK website and the purchase of our tactile products.',
    sections: [
      {
        title: 'About the Business',
        content: [
          'YUYK is an independent tactile desk companion creator based in Vijayamangalam, Perundurai, Erode, Tamil Nadu 638056, India.',
          'YUYK products are mechanical desk pets and fidget accessories designed for desk and workspace use.'
        ]
      },
      {
        title: 'Pricing & Currency',
        content: [
          'All prices are listed in Indian Rupees (INR ₹) and are inclusive of all applicable statutory taxes.',
          'Pricing promotions (such as ₹750 pre-order pricing from the original ₹999) apply during the active batch run.'
        ]
      },
      {
        title: 'Order Confirmation & Fulfillment',
        content: [
          'Order requests sent through our site via WhatsApp are verified by our customer team before dispatch.',
          'YUYK reserves the right to decline or reschedule orders in pincodes categorized as unserviceable by our courier network, with full notice to the customer.'
        ]
      },
      {
        title: 'Governing Jurisdiction',
        content: [
          'Any dispute or legal claim arising from or related to orders placed with YUYK shall be subject to the exclusive jurisdiction of the competent courts in Erode, Tamil Nadu, India.'
        ]
      }
    ]
  }
};

const POLICY_LINKS = [
  { key: 'shipping', label: 'Delivery & Shipping', path: '/shipping' },
  { key: 'returns', label: '7-Day Returns', path: '/returns' },
  { key: 'refund', label: 'Refund Policy', path: '/refund' },
  { key: 'privacy', label: 'Privacy Policy', path: '/privacy' },
  { key: 'terms', label: 'Terms & Conditions', path: '/terms' }
];

export default function PolicyPage({ policyKey = 'privacy', onNavigate }) {
  const { openCart, totalItemCount } = useCart();
  const policy = POLICIES[policyKey] || POLICIES.privacy;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `${policy.title} — YUYK`;
  }, [policyKey, policy.title]);

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="policy-page-wrapper" data-theme="ivory">
      <AnnouncementBar />

      {/* Standalone Policy Header */}
      <header className="policy-page-nav">
        <div className="policy-page-nav__inner">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="policy-page-nav__logo"
          >
            <b>YUYK</b>
            <span className="dot"></span>
          </a>

          <div className="policy-page-nav__actions">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="btn btn--sm btn--ghost"
            >
              &larr; Back to Store
            </a>

            <button
              className="cart-btn"
              onClick={openCart}
              aria-label="Open cart"
              style={{ position: 'relative' }}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" style={{ width: '20px', height: '20px' }}>
                <path d="M4 5h12l-1 9H5L4 5zM7 5V3a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1.8" fill="none" />
              </svg>
              {totalItemCount > 0 && (
                <span className="cart-btn__count">{totalItemCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="policy-page-main">
        {/* Breadcrumb */}
        <div className="policy-breadcrumb">
          <a href="/" onClick={(e) => handleLinkClick(e, '/')}>Home</a>
          <span>/</span>
          <span>Legal &amp; Policies</span>
          <span>/</span>
          <b>{policy.title}</b>
        </div>

        {/* Tab switcher */}
        <nav className="policy-switcher" aria-label="Policy tabs">
          {POLICY_LINKS.map((item) => (
            <a
              key={item.key}
              href={item.path}
              onClick={(e) => handleLinkClick(e, item.path)}
              className={`policy-switcher__tab ${policyKey === item.key ? 'is-active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Hero Section */}
        <div className="policy-hero-card">
          <span className="policy-badge">{policy.badge}</span>
          <h1 className="statement policy-hero-title">{policy.title}</h1>
          <p className="policy-hero-meta">
            Last updated: <b>{policy.lastUpdated}</b> · Vijayamangalam, Erode, Tamil Nadu
          </p>
          <p className="policy-hero-desc">{policy.description}</p>
        </div>

        {/* Document Sections */}
        <div className="policy-article-sections">
          {policy.sections.map((section, idx) => (
            <section key={idx} className="policy-article-block">
              <h2 className="policy-section-heading">
                <span className="policy-sec-number">{idx + 1}.</span> {section.title}
              </h2>
              <ul className="policy-points-list">
                {section.content.map((point, pIdx) => (
                  <li key={pIdx}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Contact Support Card */}
        <div className="policy-contact-card">
          <div>
            <h3>Questions about this policy?</h3>
            <p>
              Our local studio team in Vijayamangalam, Perundurai, Erode is always here to help you.
            </p>
            <div className="policy-contact-details">
              <span>📍 Vijayamangalam, Perundurai, Erode, Tamil Nadu 638056</span>
              <span>📧 <a href="mailto:contact.yuyk@gmail.com">contact.yuyk@gmail.com</a></span>
            </div>
          </div>
          <div>
            <a
              href="https://wa.me/918883388365?text=Hi%20YUYK%20team!%20I%20have%20a%20question%20regarding%20the%20store%20policies."
              target="_blank"
              rel="noreferrer"
              className="btn btn--lg wa-btn"
            >
              WhatsApp Support (+91 88833 88365)
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
