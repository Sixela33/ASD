import React from 'react';

const Tooltip = ({ children,  showTooltip, tooltipPosition}) => {

  return (
      showTooltip && (
        <div
          className="absolute z-10 px-2 py-1 bg-gray-800 text-white text-sm rounded-md shadow-lg"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y + 10 }}
        >
          {children}
        </div>
      )
  );
};

export default Tooltip;
