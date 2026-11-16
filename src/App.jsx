import React, { useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import Hero from './components/Hero';
import Spotlight from './components/Spotlight';
import Statement from './components/Statement';
import AboutStory from './components/AboutStory';
import ShopProducts from './components/ShopProducts';
import MerchSection from './components/MerchSection';
import InteractiveKeyboard from './components/InteractiveKeyboard';
import ComingSoonKiki from './components/ComingSoonKiki';
import Perks from './components/Perks';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import StickyCta from './components/StickyCta';
import ColorModal from './components/ColorModal';
import PolicyPage from './components/PolicyPage';

function MainContent() {
  const { toastMessage, toastVisible, currentPath, navigate } = useCart();

  const cleanPath = (currentPath || window.location.pathname).toLowerCase().replace(/\/$/, '') || '/';

  // Check if current route is a standalone policy page
  let policyKey = null;
  if (cleanPath === '/privacy' || cleanPath.startsWith('/policies/privacy')) {
    policyKey = 'privacy';
  } else if (cleanPath === '/shipping' || cleanPath === '/delivery' || cleanPath.startsWith('/policies/shipping')) {
    policyKey = 'shipping';
  } else if (cleanPath === '/returns' || cleanPath.startsWith('/policies/returns')) {
    policyKey = 'returns';
  } else if (cleanPath === '/refund' || cleanPath === '/refund-policy' || cleanPath.startsWith('/policies/refund')) {
    policyKey = 'refund';
  } else if (cleanPath === '/terms' || cleanPath === '/terms-conditions' || cleanPath.startsWith('/policies/terms')) {
    policyKey = 'terms';
  }

  useEffect(() => {
    // Dynamic theme switching on scroll matching Desktop Buddy's aesthetic
    const themeSections = document.querySelectorAll('[data-theme]');
    if (!themeSections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute('data-theme');
            if (theme) {
              document.body.setAttribute('data-theme', theme);
            }
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    themeSections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [currentPath]);

  // If on a standalone policy page route, render the standalone PolicyPage
  if (policyKey) {
    return (
      <>
        <PolicyPage policyKey={policyKey} onNavigate={navigate} />
        <div
          className={`toast ${toastVisible ? 'is-on' : ''}`}
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      </>
    );
  }

  // Otherwise render the main storefront
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <AnnouncementBar />
      <Header />

      <main id="main" role="main">
        <Hero />
        <Spotlight />
        <Statement />
        <AboutStory />
        <ShopProducts />
        <MerchSection />
        <InteractiveKeyboard />
        <ComingSoonKiki />
      </main>

      <Perks />
      <Footer />

      <CartDrawer />
      <StickyCta />
      <ColorModal />

      {/* Floating Toast Notification */}
      <div
        className={`toast ${toastVisible ? 'is-on' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainContent />
    </CartProvider>
  );
}
