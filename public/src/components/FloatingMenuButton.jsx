import React, { useState } from 'react';
import Tooltip from './Tooltip';

const FloatingMenuButton = ({ options }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [TooltipText, setTooltipText] = useState(null)

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleMouseMove = (e) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (text) => {
      setShowTooltip(true);
      setTooltipText(text)
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setTooltipText(null)
  };


  return (
    <>
     <Tooltip showTooltip={showTooltip} tooltipPosition={tooltipPosition}>
        {TooltipText}
      </Tooltip>
      <div className="fixed bottom-4 right-4">
        <button className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl focus:outline-none" onClick={toggleOptions} >
          <span>+</span>
        </button>
        {showOptions && (
          <div className="absolute bottom-16 right-0">
            <ul>
              {options.map((option, index) => (
                <li key={index} className="mb-2"
                  onMouseEnter={() => handleMouseEnter(option.text)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  >
                  <button className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg focus:outline-none mr-2" onClick={option.action}>
                    {option.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>

  );
};

export default FloatingMenuButton;
