import React from 'react';

const CrtOverlay: React.FC = () => {
  return (
    <div className="crt-overlay-container">
      <div className="crt-scanlines"></div>
      <div className="crt-vignette"></div>
      <div className="crt-flicker"></div>
    </div>
  );
};

export default CrtOverlay;
