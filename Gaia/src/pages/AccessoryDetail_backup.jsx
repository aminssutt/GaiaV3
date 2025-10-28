import React, { useMemo, useState } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { accessories } from '../data/accessories';
import './Accessories.css';

// Import emoji images for buttons
import moneyEmoji from '../../images/emojis/money.png';
import coeurEmoji from '../../images/emojis/coeur.png';
import tdEmoji from '../../images/emojis/3d.png';
import voitureEmoji from '../../images/emojis/voiture.png';

function AccessoryDetail({ onNavigate, addToWishlist, accessoryId }) {
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
  }

  const handleConfirm = () => {
    setShowConfirm(false);
    if (accessory.name === 'Pillow Massage') onNavigate('pillowPreview');
    else if (accessory.name === 'Scent Diffuser') onNavigate('scentPreview');
    else if (accessory.name === 'Fresh Air Purifier') onNavigate('airPreview');
  }

  return (
    <div className="accessories-page fade-in">
      <div className="accessories-header">
        <button className="back-btn" onClick={() => onNavigate('accessories')}>← Back</button>
        <h1>{accessory.name}</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-view-wishlist" onClick={() => onNavigate('wishlist')}>
            <span className="btn-icon">👁️</span>
            <span className="btn-text">View Wishlist</span>
          </button>
        </div>
      </div>

      <div className="accessory-details">
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
              <button className="btn-buy">
                <span className="btn-icon">
                  <img src={moneyEmoji} alt="Buy" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
                </span>
                <span className="btn-text">Buy Now</span>
              </button>
              <button className="btn-wishlist" onClick={() => addToWishlist(accessory)}>
                <span className="btn-icon">
                  <img src={coeurEmoji} alt="Wishlist" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
                </span>
                <span className="btn-text">Add to Wishlist</span>
              </button>
              {(accessory.name === 'Pillow Massage' || accessory.name === 'Scent Diffuser' || accessory.name === 'Fresh Air Purifier') && (
                <button className="btn-preview-3d" onClick={handlePreview}>
                  <span className="btn-icon">
                    <img src={tdEmoji} alt="3D Preview" style={{width: '1.2rem', height: '1.2rem', objectFit: 'contain'}} />
                  </span>
                  <span className="btn-text">Preview 3D Model</span>
                </button>
              )}
              {(accessory.imageVehicleWebp || accessory.imageVehiclePng) && (
                <button className="btn-preview-car" onClick={() => setShowInCar(true)}>
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
      {showInCar && (() => {
        const base = import.meta.env.BASE_URL || '/';
        const imagesBase = `${base}images/`;
        const webp = accessory.imageVehicleWebp ? imagesBase + accessory.imageVehicleWebp : null;
        const png = accessory.imageVehiclePng ? imagesBase + accessory.imageVehiclePng : null;
        return (
          <ImagePreviewModal
            title={`${accessory.name} — In-Car Preview`}
            webpSrc={webp}
            pngSrc={png}
            onClose={() => setShowInCar(false)}
          />
        );
      })()}
    </div>
  );
}

export default AccessoryDetail;