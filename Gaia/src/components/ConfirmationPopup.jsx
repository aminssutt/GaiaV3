import React from 'react';
import './ConfirmationPopup.css';

/*
  Extended popup component.
  New optional props:
    variant: 'exercise' | 'accessoryPreview' (default 'exercise')
    customTitle / customMessage: used when variant === 'accessoryPreview'
    confirmLabel / cancelLabel: override button labels
  Backwards compatible with previous usage (existing calls keep same behaviour).
*/
function ConfirmationPopup({
  bodyPart,
  onConfirm,
  onCancel,
  variant = 'exercise',
  customTitle,
  customMessage,
  confirmLabel = 'Yes',
  cancelLabel = 'No'
}) {
  const isPillow = bodyPart === 'pillow';
  const isScent = bodyPart === 'scent';

  // Accessory preview variant has priority when specified.
  if (variant === 'accessoryPreview') {
    const title = customTitle || 'Accessory Preview';
    const message = customMessage || 'Show this accessory on the avatar?';
    return (
      <div className="confirmation-overlay">
        <div className="confirmation-popup">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="popup-buttons">
            <button className="yes-btn" onClick={onConfirm}>{confirmLabel}</button>
            <button className="no-btn" onClick={onCancel}>{cancelLabel}</button>
          </div>
        </div>
      </div>
    );
  }

  // Legacy exercise / pillow / scent behaviour
  const title = isPillow ? 'Pillow Preview' : isScent ? 'Scent Diffuser Preview' : 'Exercise Confirmation';
  const message = isPillow
    ? 'Do you want to preview the 3D pillow?'
    : isScent
    ? 'Do you want to preview the 3D scent diffuser?'
    : 'You want to see special exercises about ';
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-popup">
        <h3>{title}</h3>
        <p>
          {message}
          {!isPillow && !isScent && <><strong>{bodyPart}</strong>?</>}
        </p>
        <div className="popup-buttons">
          <button className="yes-btn" onClick={onConfirm}>{confirmLabel}</button>
          <button className="no-btn" onClick={onCancel}>{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPopup;
