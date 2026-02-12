import React from 'react';
import './Accessories.css';
import './Wishlist.css';

export default function Wishlist({ items, onNavigate, onPurchase, onRemove }) {
  return (
    <div className="accessories-page fade-in">
      <div className="accessories-header">
        <button className="back-btn" onClick={() => onNavigate('accessories')}>
          ← Back
        </button>
        <h1>My Wishlist</h1>
      </div>

      {(!items || items.length === 0) ? (
        <div style={{ color: '#a0a0a0', textAlign: 'center', padding: '40px' }}>
          Your wishlist is empty.
        </div>
      ) : (
        <div className="wishlist-grid-wrap">
          <div className="wishlist-grid">
            {items.map((item) => (
              <div key={item.id} className="wishlist-card">
                <div className="wishlist-image">
                  <img className="wishlist-img" src={item.image} alt={item.name} />
                </div>
                <h3 className="wishlist-title">{item.name}</h3>
                <p className="wishlist-price">{item.price}</p>
                <div className="wishlist-actions">
                  <button className="purchase-btn" onClick={() => onPurchase(item)}>Buy</button>
                  <button className="wishlist-btn" onClick={() => onRemove(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

