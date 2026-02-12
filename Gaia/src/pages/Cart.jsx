import React, { useMemo, useState } from 'react';
import './Cart.css';

export default function Cart({ items, onNavigate, onRemove, onUpdateQty, onCheckout, openPayment }) {
  const [showPayment, setShowPayment] = useState(!!openPayment);
  // react to navigation-triggered openPayment
  React.useEffect(() => { if (openPayment) setShowPayment(true); }, [openPayment]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const numeric = parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
      return sum + numeric * (it.quantity || 1);
    }, 0);
  }, [items]);

  const handleBuyAll = () => {
    if (items.length === 0) return;
    setShowPayment(true);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    onCheckout?.(items);
  };

  return (
    <div className="cart-page fade-in">
      <div className="cart-shell">
        <div className="cart-left">
          <div className="cart-header-row">
            <h1>Your Cart</h1>
            <span className="cart-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          {items.length === 0 && (
            <div className="cart-empty">Cart is empty.</div>
          )}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-main">
                  <div className="cart-thumb">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-title">{item.name}</div>
                    <div className="cart-item-price">{item.price}</div>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-box">
                    <button onClick={() => onUpdateQty(item.id, (item.quantity || 1) - 1)} disabled={(item.quantity || 1) <= 1}>-</button>
                    <span>x{item.quantity || 1}</span>
                    <button onClick={() => onUpdateQty(item.id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <button className="btn-remove" onClick={() => onRemove(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-footer-actions">
            <button className="cart-secondary" onClick={() => onNavigate('accessories')}>Continue Shopping</button>
            <button className="cart-primary" disabled={!items.length} onClick={handleBuyAll}>Buy All</button>
          </div>
        </div>
        <div className={`cart-payment-wrapper ${showPayment ? 'open' : ''}`}>
          <div className="payment-panel">
            <div className="payment-header">
              <h2>Payment Method</h2>
              <button className="close-pay" onClick={() => setShowPayment(false)}>×</button>
            </div>
            <p className="payment-secure">🔒 Secure, fast checkout</p>
            <div className="payment-summary-row"><span>Subtotal:</span><strong>${subtotal.toFixed(2)}</strong></div>
            <form onSubmit={handleProceed} className="payment-form">
              <label>
                <span>Card number</span>
                <input required placeholder="4242 4242 4242 4242" maxLength={23} />
              </label>
              <div className="form-row-2">
                <label>
                  <span>Expiry</span>
                  <input required placeholder="MM/YY" maxLength={5} />
                </label>
                <label>
                  <span>CVC</span>
                  <input required placeholder="•••" maxLength={4} />
                </label>
              </div>
              <label>
                <span>Country</span>
                <select defaultValue="US">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="KR">South Korea</option>
                </select>
              </label>
              <button type="submit" className="checkout-btn" disabled={!items.length}>Proceed to Checkout</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

