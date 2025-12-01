import React, { useEffect } from 'react';

// Reusable Modal component
// Props:
// - children: modal content
// - onClose: function to call when backdrop clicked or Escape pressed
// - maxWidth: optional tailwind max-w-* class (default: max-w-2xl)
// - className: additional classes for the panel

const Modal = ({ children, onClose, maxWidth = 'max-w-2xl', className = '' }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (  
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={() => onClose && onClose()} />
      <div className={`relative w-full ${maxWidth} ${className}`}>{children}</div>
    </div>
  );
};

export default Modal;