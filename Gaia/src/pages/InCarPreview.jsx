import React from 'react';
import './InCarPreview.css';

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

export default function InCarPreview({ onNavigate, accessoryName }) {
  const img = inCarImages[accessoryName];
  const accessoryId = (() => { switch (accessoryName) { case 'Pillow Massage': return 1; case 'Scent Diffuser': return 2; case 'Fresh Air Purifier': return 3; case 'Shoes Massage': return 4; case 'Neck Massager': return 5; default: return null; } })();
  return (
    <div className="in-car-page fade-in">
      <div className="in-car-header">
        <button className="back-btn" onClick={() => onNavigate('accessoryDetail', { accessoryId })}>← Back</button>
        <h1>{accessoryName} – In-Car Preview</h1>
      </div>
      <div className="in-car-image-wrapper">
        {img ? (() => {
          // Cropped images have uniform bounding boxes; generic class now sufficient
          const cls = 'size-generic';
          return (
            <img
              src={img}
              alt={accessoryName + ' In-Car'}
              className={cls}
            />
          );
        })() : <div className="in-car-missing">No preview available.</div>}
      </div>
    </div>
  );
}

