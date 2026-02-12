import React, { useMemo, useState } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import { accessories } from '../data/accessories';
import './Accessories.css';

// Import emoji images for buttons
import moneyEmoji from '../../images/emojis/money.png';
import coeurEmoji from '../../images/emojis/coeur.png';
import tdEmoji from '../../images/emojis/3d.png';
import voitureEmoji from '../../images/emojis/voiture.png';

// In-car preview PNGs imported directly
import pillowViewPng from '../../images/pillow_massage_view_cropped.png';
import scentViewPng from '../../images/scent_diffuseur_view_cropped.png';
import airViewPng from '../../images/air_refresh_view_cropped.png';
import shoesViewPng from '../../images/shoes_massage_view_cropped.png';
import neckViewPng from '../../images/neck_massage_view_cropped.png';

const inCarImages = {
  'Pillow Massage': pillowViewPng,
  'Scent Diffuser': scentViewPng,
  'Fresh Air Purifier': airViewPng,
  'Shoes Massage': shoesViewPng,
  'Neck Massager': neckViewPng,
};

function AccessoryDetail({ onNavigate, addToCart, buyNow, accessoryId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInCar, setShowInCar] = useState(false);

  const accessory = useMemo(() => {
    if (accessoryId == null) return null;
    return accessories.find(a => String(a.id) === String(accessoryId));
  }, [accessoryId]);

  if (!accessory) {
    return (
      <div className="accessories-page fade-in">
        <div className="accessories-header">
          <button className="back-btn" onClick={() => onNavigate('accessories')}>← Back</button>
          <h1>Accessory</h1>
        </div>
        <div style={{padding: 20}}>Not found.</div>
      </div>
    );
  }

  const handlePreview = () => {
    if (accessory.name === 'Pillow Massage') setShowConfirm(true);
    else if (accessory.name === 'Scent Diffuser') setShowConfirm(true);
    else if (accessory.name === 'Fresh Air Purifier') setShowConfirm(true);
    else if (accessory.name === 'Shoes Massage') setShowConfirm(true);
    else if (accessory.name === 'Neck Massager') setShowConfirm(true);
  }

  const handleConfirm = () => {
    setShowConfirm(false);
    if (accessory.name === 'Pillow Massage') onNavigate('pillowPreview');
    else if (accessory.name === 'Scent Diffuser') onNavigate('scentPreview');
    else if (accessory.name === 'Fresh Air Purifier') onNavigate('airPreview');
    else if (accessory.name === 'Shoes Massage') onNavigate('shoesPreview');
    else if (accessory.name === 'Neck Massager') onNavigate('neckPreview');
  }

  const imageVehiclePng = inCarImages[accessory.name];

  return (
    <div className="accessories-page fade-in accessory-detail-layout">
      <div className="accessories-header">
        <button className="back-btn" onClick={() => onNavigate('accessories')}>← Back</button>
        <h1>{accessory.name}</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-view-wishlist" onClick={() => onNavigate('cart')}>
            <span className="btn-icon">
              <img src={coeurEmoji} alt="View Cart" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
            </span>
            <span className="btn-text">View Cart</span>
          </button>
        </div>
      </div>

  <div className="accessory-details accessory-detail-center">
        <div className="accessory-main">
          <div className="accessory-hero">
            <div className="accessory-hero-image">
              {typeof accessory.image === 'string' && accessory.image.startsWith('data:') || accessory.image?.startsWith?.('http') ? (
                <img src={accessory.image} alt={accessory.name} style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain' }} />
              ) : (
                <img src={accessory.image} alt={accessory.name} style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain' }} />
              )}
            </div>
            <h2>{accessory.name}</h2>
            <p className="accessory-description">{accessory.description}</p>
            <p className="accessory-price-large">{accessory.price}</p>
          </div>

          <div className="accessory-features">
            <h3>Features</h3>
            <ul>
              {accessory.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
            <div className="feature-actions">
              <button className="btn-buy" onClick={() => buyNow(accessory)}>
                <span className="btn-icon">
                  <img src={moneyEmoji} alt="Buy" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
                </span>
                <span className="btn-text">Buy Now</span>
              </button>
              <button className="btn-cart-add" onClick={() => addToCart(accessory)}>
                <span className="btn-icon">
                  <img src={coeurEmoji} alt="Cart" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
                </span>
                <span className="btn-text">Add to Cart</span>
              </button>
              {(accessory.name === 'Pillow Massage' || accessory.name === 'Scent Diffuser' || accessory.name === 'Fresh Air Purifier' || accessory.name === 'Shoes Massage' || accessory.name === 'Neck Massager') && (
                <button className="btn-preview-3d" onClick={handlePreview}>
                  <span className="btn-icon">
                    <img src={tdEmoji} alt="3D Preview" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
                  </span>
                  <span className="btn-text">Preview 3D Model</span>
                </button>
              )}
              {imageVehiclePng && (
                <button className="btn-preview-car" onClick={() => onNavigate('inCarPreview', { accessoryName: accessory.name })}>
                  <span className="btn-icon">
                    <img src={voitureEmoji} alt="Car Preview" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
                  </span>
                  <span className="btn-text">Preview In-Car Model</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmationPopup
          bodyPart={accessory.name === 'Pillow Massage' ? 'pillow' : accessory.name === 'Scent Diffuser' ? 'scent' : accessory.name === 'Fresh Air Purifier' ? 'air' : accessory.name}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {/* In-car preview modal removed; now handled as its own page via navigation */}
    </div>
  );
}

export default AccessoryDetail;
