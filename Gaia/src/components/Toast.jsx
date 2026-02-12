import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'success', visible, onClose, duration = 2200 }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  return (
    <div className={`toast ${type} ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}

