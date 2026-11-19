import React, { useState } from 'react';
import { useCart, FREE_DELIVERY_THRESHOLD } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotalINR,
    isFreeDelivery,
    formatPrice,
    promoCode,
    applyPromoCode,
    totalItemCount
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [step, setStep] = useState('cart'); // 'cart' | 'shipping' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'whatsapp'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    notes: ''
  });
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  const deliveryFee = isFreeDelivery ? 0 : 50;
  const finalTotal = subtotalINR + deliveryFee;
  const amountAway = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotalINR);
  const deliveryProgress = Math.min(100, (subtotalINR / FREE_DELIVERY_THRESHOLD) * 100);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      applyPromoCode(inputCode);
      setInputCode('');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const ensureRazorpayLoaded = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        return resolve(true);
      }
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true), { once: true });
        existingScript.addEventListener('error', () => resolve(false), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.pincode.trim()
    ) {
      setSubmitError('Please fill in your name, phone number, address, city, and pincode.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setSubmitError('Please enter a valid 6-digit Indian pincode.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Payment gateway could not be loaded. Please check your internet connection or use WhatsApp order.');
      }

      // Step 1: Create Razorpay order on server
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cart.map(({ id, variant, quantity }) => ({ id, variant, quantity })),
          promoCode
        })
      });

      let orderPayload;
      try {
        orderPayload = await response.json();
      } catch {
        throw new Error('The payment server returned an invalid response. Your cart is unchanged.');
      }

      if (!response.ok) {
        throw new Error(orderPayload.error || 'Failed to initialize payment.');
      }

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderPayload.keyId,
        amount: orderPayload.amount,
        currency: orderPayload.currency || 'INR',
        name: 'YUYK',
        description: 'Tactile Desktop Pet Order',
        image: '/assets/favicon.svg',
        order_id: orderPayload.razorpayOrderId,
        prefill: {
          name: formData.name.trim(),
          contact: formData.phone.trim()
        },
        notes: {
          address: `${formData.address.trim()}, ${formData.city.trim()} - ${formData.pincode.trim()}`,
          notes: formData.notes.trim()
        },
        theme: {
          color: '#ff5c35'
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          }
        },
        handler: async (paymentResponse) => {
          try {
            setIsSubmitting(true);
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderPayload.orderId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }

            try {
              const confetti = (await import('canvas-confetti')).default;
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } catch {}

            setLastOrderDetails({
              customer: formData.name,
              total: finalTotal,
              orderId: orderPayload.orderId,
              paymentId: paymentResponse.razorpay_payment_id,
              paymentMethod: 'razorpay'
            });
            setStep('success');
            clearCart();
          } catch (err) {
            setSubmitError(err.message || 'Payment received, but verification failed. Please contact us on WhatsApp.');
          } finally {
            setIsSubmitting(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', (resp) => {
        setIsSubmitting(false);
        setSubmitError(`Payment failed: ${resp.error?.description || 'Transaction was declined.'}`);
      });
      rzpInstance.open();
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(error.message || 'Could not initiate payment. Please try again or use WhatsApp order.');
    }
  };

  const handlePlaceWhatsAppOrder = async (e) => {
    if (e) e.preventDefault();

    if (isSubmitting) return;
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.pincode.trim()
    ) {
      setSubmitError('Please fill in your name, phone number, address, city, and pincode.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setSubmitError('Please enter a valid 6-digit Indian pincode.');
      return;
    }

    // Format ordered items list
    const itemsList = cart
      .map(
        (item, index) =>
          `${index + 1}. *${item.title}* (${item.variant}) x${item.quantity} - ₹${item.price * item.quantity}`
      )
      .join('\n');

    // Construct structured WhatsApp message
    const message =
`👋 *NEW ORDER REQUEST - YUYK* 🚀
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${formData.name.trim()}
📞 *Phone:* ${formData.phone.trim()}
📍 *Shipping Address:*
${formData.address.trim()}, ${formData.city.trim()} - ${formData.pincode.trim()}
${formData.notes ? `📝 *Notes:* ${formData.notes.trim()}\n` : ''}
📦 *Items Requested:*
${itemsList}

💵 *Subtotal:* ₹${subtotalINR}
🚚 *Delivery:* ${isFreeDelivery ? 'FREE (Unlocked)' : '₹50'}
💰 *Estimated Total:* ₹${finalTotal}

🏭 *Dispatch From:* Vijayamangalam, Perundurai, Erode (TN)
━━━━━━━━━━━━━━━━━━━━
Hi team! I would like to order this. Please contact me with confirmation and delivery details!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918883388365?text=${encodedMessage}`;

    const whatsappWindow = window.open('', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cart.map(({ id, variant, quantity }) => ({ id, variant, quantity })),
          promoCode
        })
      });

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error('The order service returned an invalid response. Your cart is unchanged.');
      }
      if (!response.ok) {
        throw new Error(payload.error || 'The order could not be saved. Your cart is unchanged.');
      }

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl;
      }
      setLastOrderDetails({
        customer: formData.name,
        total: finalTotal,
        orderId: payload.orderId,
        whatsappUrl,
        paymentMethod: 'whatsapp'
      });
      setStep('success');
      clearCart();
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
      setSubmitError(error.message || 'The order could not be saved. Your cart is unchanged.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (paymentMethod === 'razorpay') {
      handleRazorpayCheckout(e);
    } else {
      handlePlaceWhatsAppOrder(e);
    }
  };

  const handleDrawerClose = () => {
    if (step === 'success') {
      setStep('cart');
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        notes: ''
      });
    }
    closeCart();
  };

  return (
    <aside
      className={`cart ${isCartOpen ? 'is-open' : ''}`}
      aria-label="Cart Drawer"
      aria-hidden={!isCartOpen}
    >
      <div className="cart__scrim" onClick={handleDrawerClose}></div>

      <div className="cart__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        {/* Cart Header */}
        <header className="cart__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {step === 'shipping' && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => setStep('cart')}
                aria-label="Back to Cart"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" style={{ width: '16px', height: '16px' }}>
                  <path d="M13 16l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <h2 id="cart-title">
              {step === 'cart' && `Your cart ${totalItemCount > 0 ? `(${totalItemCount})` : ''}`}
              {step === 'shipping' && 'Delivery & WhatsApp Order'}
              {step === 'success' && 'Request Sent!'}
            </h2>
          </div>

          <button className="icon-btn" type="button" onClick={handleDrawerClose} aria-label="Close cart">
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </header>

        {/* Free Delivery Meter (in cart step only) */}
        {step === 'cart' && totalItemCount > 0 && (
          <div className="cart__free">
            {promoCode ? (
              <p>
                Free delivery code <b>{promoCode}</b> applied!
              </p>
            ) : isFreeDelivery ? (
              <p>
                You've unlocked <b>free delivery</b>!
              </p>
            ) : (
              <p>
                You're <b>{formatPrice(amountAway)}</b> away from free delivery
              </p>
            )}
            <div className="meter">
              <span style={{ width: `${promoCode || isFreeDelivery ? 100 : deliveryProgress}%` }}></span>
            </div>
          </div>
        )}

        {/* Cart Body */}
        <div className="cart__body">
          {/* STEP 1: CART ITEMS */}
          {step === 'cart' && (
            <>
              {totalItemCount === 0 ? (
                <div className="cart__empty">
                  <p>Your cart is empty.</p>
                  <button className="btn" onClick={closeCart}>
                    Shop YUYK
                  </button>
                </div>
              ) : (
                <>
                  <ul className="cart__lines">
                    {cart.map((item) => (
                      <li key={`${item.id}-${item.variant}`} className="line">
                        <div className="line__media">
                          <img src={item.image} alt={item.title} width="80" height="80" />
                        </div>
                        <div className="line__info">
                          <div className="line__name">{item.title}</div>
                          <p className="line__meta">
                            {item.type} · {item.variant}
                          </p>
                          <div className="qty" role="group" aria-label="Quantity">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.variant, -1)}
                              aria-label="Decrease quantity"
                            >
                              &minus;
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.variant, 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="line__end">
                          <p className="line__price">{formatPrice(item.price * item.quantity)}</p>
                          <button
                            className="link-btn"
                            type="button"
                            onClick={() => removeFromCart(item.id, item.variant)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Promo Code Form */}
                  <form onSubmit={handleApplyPromo} className="promo-box" style={{ marginTop: '20px' }}>
                    <input
                      type="text"
                      placeholder="Promo code (try SPELLBUDDY)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                    />
                    <button type="submit" className="btn btn--sm btn--ink">
                      Apply
                    </button>
                  </form>
                </>
              )}
            </>
          )}

          {/* STEP 2: SHIPPING & CHECKOUT FORM */}
          {step === 'shipping' && (
            <form id="checkout-order-form" onSubmit={handleSubmitOrder} className="checkout-form">
              {submitError && <p className="checkout-error" role="alert">{submitError}</p>}

              {/* Payment Method Selector */}
              <div className="form-group" style={{ marginBottom: '4px' }}>
                <label>Choose Payment Method *</label>
                <div className="payment-options">
                  <label
                    className={`payment-card payment-card--rzp ${paymentMethod === 'razorpay' ? 'is-selected' : ''}`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                    />
                    <div className="payment-card__content" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <b>Pay Online (Razorpay)</b>
                        <span className="rzp-badge">⚡ Instant</span>
                      </div>
                      <span>UPI (GPay / PhonePe / Paytm), Cards, NetBanking</span>
                    </div>
                  </label>

                  <label
                    className={`payment-card ${paymentMethod === 'whatsapp' ? 'is-selected' : ''}`}
                    onClick={() => setPaymentMethod('whatsapp')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="whatsapp"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                    />
                    <div className="payment-card__content">
                      <b>WhatsApp Direct Order</b>
                      <span>Pre-order &amp; confirm delivery via WhatsApp chat</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Mode intro info */}
              {paymentMethod === 'razorpay' ? (
                <div className="checkout-intro" style={{ background: 'rgba(235, 78, 43, 0.08)', borderColor: 'rgba(235, 78, 43, 0.25)' }}>
                  <span className="wa-pill" style={{ background: 'var(--red)' }}>
                    🔒 100% Secure Checkout
                  </span>
                  <p>
                    Pay securely with <b>Razorpay</b> via UPI, Card, or NetBanking. Once paid, your order is automatically confirmed and dispatched from our Erode studio.{' '}
                    <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
                  </p>
                </div>
              ) : (
                <div className="checkout-intro">
                  <span className="wa-pill">
                    <span className="wa-dot"></span> WhatsApp Direct Order
                  </span>
                  <p>
                    Fill in your delivery address below. Your order request will be saved before WhatsApp opens. <b>Our team will contact you directly to confirm delivery!</b>{' '}
                    <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
                  </p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="customer-name">Full Name *</label>
                <input
                  id="customer-name"
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-phone">WhatsApp / Mobile Number *</label>
                <input
                  id="customer-phone"
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 98420 12345"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-address">Delivery Address (Door No, Street, Area) *</label>
                <textarea
                  id="customer-address"
                  name="address"
                  rows="2"
                  required
                  placeholder="e.g. 12/4 Gandhipuram, Near Bus Stop"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer-city">City / Town *</label>
                  <input
                    id="customer-city"
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Erode / Coimbatore"
                    value={formData.city}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customer-pincode">Pincode *</label>
                  <input
                    id="customer-pincode"
                    type="text"
                    name="pincode"
                    required
                    maxLength="6"
                    placeholder="e.g. 638056"
                    value={formData.pincode}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="checkout-summary-box">
                <div className="sum-line">
                  <span>Order Items:</span>
                  <b>{totalItemCount} item(s)</b>
                </div>
                <div className="sum-line">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotalINR)}</span>
                </div>
                <div className="sum-line">
                  <span>Delivery (from Erode):</span>
                  <span>{isFreeDelivery ? 'FREE' : formatPrice(50)}</span>
                </div>
                <div className="sum-line sum-line--total">
                  <span>Total Payable:</span>
                  <b>{formatPrice(finalTotal)}</b>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUCCESS */}
          {step === 'success' && (
            <div className="cart__empty" style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '54px', marginBottom: '12px' }}>🎉</div>

              {lastOrderDetails?.paymentMethod === 'razorpay' ? (
                <>
                  <span className="wa-pill" style={{ background: '#0e8a16', marginBottom: '12px', display: 'inline-block' }}>
                    ✓ Payment Verified · Paid
                  </span>
                  <h3 style={{ fontSize: '26px', marginBottom: '8px' }}>Payment Successful!</h3>
                  <p style={{ color: 'var(--soft)', fontSize: '15px', lineHeight: 1.5, marginBottom: '16px' }}>
                    Thank you, <b>{lastOrderDetails?.customer}</b>! Your order <b>#{lastOrderDetails?.orderId?.slice(0, 8).toUpperCase()}</b> has been confirmed.
                    {lastOrderDetails?.paymentId && (
                      <span style={{ display: 'block', fontSize: '12px', marginTop: '6px', fontFamily: 'var(--mono)', color: 'var(--ink)' }}>
                        Payment ID: {lastOrderDetails.paymentId}
                      </span>
                    )}
                  </p>

                  <div style={{ background: 'rgba(20,20,20,0.04)', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left', fontSize: '13px', lineHeight: 1.6 }}>
                    <div>🏭 <b>Dispatching from:</b> Vijayamangalam, Erode (TN)</div>
                    <div>📦 <b>Estimated Delivery:</b> 2 to 4 business days</div>
                    <div>🚚 <b>Couriers:</b> Blue Dart, Delhivery, DTDC, India Post</div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <a
                      href={`https://wa.me/918883388365?text=${encodeURIComponent(`Hi YUYK team! I have completed payment for Order #${lastOrderDetails?.orderId?.slice(0, 8).toUpperCase()} (Payment ID: ${lastOrderDetails?.paymentId}). Please share dispatch tracking when ready!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--block btn--lg wa-btn"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '8px' }}>
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.4 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.25-8.22 8.25zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z"/>
                      </svg>
                      Get Tracking Updates on WhatsApp
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '26px', marginBottom: '8px' }}>Request Sent via WhatsApp!</h3>
                  <p style={{ color: 'var(--soft)', fontSize: '15px', lineHeight: 1.5, marginBottom: '24px' }}>
                    Thank you, <b>{lastOrderDetails?.customer}</b>! Order request <b>#{lastOrderDetails?.orderId?.slice(0, 8).toUpperCase()}</b> was saved. Use the button below to open WhatsApp and send it to <b>+91 88833 88365</b>; our team will contact you to confirm.
                  </p>

                  {lastOrderDetails?.whatsappUrl && (
                    <div style={{ marginBottom: '20px' }}>
                      <a
                        href={lastOrderDetails.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--block btn--lg wa-btn"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '8px' }}>
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.4 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.25-8.22 8.25zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z"/>
                        </svg>
                        Re-open WhatsApp Chat
                      </a>
                    </div>
                  )}
                </>
              )}

              <button
                className="btn btn--block btn--ghost"
                onClick={() => {
                  setStep('cart');
                  closeCart();
                }}
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {step === 'cart' && totalItemCount > 0 && (
          <footer className="cart__foot">
            <dl className="sum">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotalINR)}</dd>
              </div>
              <div>
                <dt>Delivery (Erode Dispatch)</dt>
                <dd>{isFreeDelivery ? 'Free' : formatPrice(50)}</dd>
              </div>
              <div className="sum__total">
                <dt>Total</dt>
                <dd>{formatPrice(finalTotal)}</dd>
              </div>
            </dl>

            <button className="btn btn--block btn--lg" onClick={() => setStep('shipping')}>
              Proceed to Order · {formatPrice(finalTotal)} &rarr;
            </button>

            <p className="cart__assure">
              Instant Online Payment (Razorpay) or Direct WhatsApp Order
            </p>
          </footer>
        )}

        {step === 'shipping' && (
          <footer className="cart__foot">
            {paymentMethod === 'razorpay' ? (
              <button
                type="submit"
                form="checkout-order-form"
                disabled={isSubmitting}
                className="btn btn--block btn--lg razorpay-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                {isSubmitting ? 'Opening Razorpay…' : `Pay ${formatPrice(finalTotal)} with UPI / Cards`}
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-order-form"
                disabled={isSubmitting}
                className="btn btn--block btn--lg wa-btn"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.4 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.25-8.22 8.25zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z"/>
                </svg>
                {isSubmitting ? 'Saving order…' : `Send Request on WhatsApp · ${formatPrice(finalTotal)}`}
              </button>
            )}

            <p className="cart__assure" style={{ textAlign: 'center', fontSize: '12px' }}>
              {paymentMethod === 'razorpay'
                ? '🔒 100% Secure Checkout powered by Razorpay · Pan-India Dispatch'
                : 'Our Erode team will reach out on WhatsApp (+91 88833 88365) to confirm & dispatch'}
            </p>
          </footer>
        )}
      </div>
    </aside>
  );
}
