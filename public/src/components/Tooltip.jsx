import React from 'react';

const Tooltip = ({ children, showTooltip, tooltipPosition }) => {
  let tooltipLeft = tooltipPosition.x;
  let tooltipTop = tooltipPosition.y + 10; 

  const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const tooltipWidth = 100

  if (tooltipLeft + tooltipWidth > windowWidth) {
    tooltipLeft = tooltipPosition.x - tooltipWidth;
  }

  return (
    (showTooltip && children) && (
      <div className="absolute z-50 px-2 py-1 bg-gray-800 text-white text-sm rounded-md shadow-lg" style={{ left: tooltipLeft, top: tooltipTop }}>
        {children}
      </div>
    )
  );
};

export default Tooltip;
