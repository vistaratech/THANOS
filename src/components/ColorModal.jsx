import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const VARIANTS = [
  { name: 'Cyber Orange', hex: '#FF7A00', bg: '#FF7A00' },
  { name: 'Cosmonaut Blue', hex: '#154586', bg: '#154586' },
  { name: 'Chunky Red', hex: '#ED4027', bg: '#ED4027' },
  { name: 'Ivory Cream', hex: '#FEF5E1', border: '#14141433' }
];

export default function ColorModal() {
  const { selectedProductForModal, closeColorModal, addToCart, formatPrice } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0].name);

  if (!selectedProductForModal) return null;

  const handleAdd = () => {
    addToCart(selectedProductForModal, selectedVariant);
    closeColorModal();
  };

  return (
    <div className="modal-overlay" onClick={closeColorModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span className="pcard__badge" style={{ position: 'static', marginBottom: '8px', display: 'inline-block' }}>
              Pre-order
            </span>
            <h2 className="statement" style={{ fontSize: '32px' }}>
              {selectedProductForModal.title}
            </h2>
            <p style={{ color: 'var(--soft)', fontSize: '15px' }}>
              Select your favorite tactile companion color
            </p>
          </div>
          <button
            className="icon-btn"
            onClick={closeColorModal}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
          <img
            src={selectedProductForModal.image}
            alt=""
            style={{ borderRadius: '16px', width: '100%', height: '120px', objectFit: 'cover' }}
          />
          <div>
            <p className="price" style={{ margin: '0 0 6px 0', fontSize: '24px' }}>
              {formatPrice(selectedProductForModal.price)}
              {selectedProductForModal.originalPrice && (
                <s className="pcard__was">{formatPrice(selectedProductForModal.originalPrice)}</s>
              )}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>
              ✓ In stock for pre-order batch 1
            </p>
            <p style={{ fontSize: '13px', color: 'var(--soft)' }}>
              Cash on delivery available
            </p>
          </div>
        </div>

        {/* Color Choices */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
            Colour: <span style={{ color: 'var(--soft)', fontWeight: 400 }}>{selectedVariant}</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {VARIANTS.map((v) => {
              const isSelected = selectedVariant === v.name;
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setSelectedVariant(v.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '999px',
                    border: isSelected ? '2px solid var(--ink)' : '1px solid rgba(20,20,20,0.18)',
                    background: isSelected ? 'var(--ink)' : '#fff',
                    color: isSelected ? 'var(--ivory)' : 'var(--ink)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: v.hex,
                      border: v.border ? `1px solid ${v.border}` : 'none',
                      display: 'inline-block'
                    }}
                  />
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn--block btn--lg" onClick={handleAdd}>
            Add to cart · {selectedVariant}
          </button>
        </div>
      </div>
    </div>
  );
}
