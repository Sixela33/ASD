import React, { useState, useEffect, useRef } from 'react';
import Tooltip from '../Tooltip';
import { FiMoreHorizontal } from "react-icons/fi";
import './FloatingMenuButton.css'
import useAuth from '../../hooks/useAuth';

const FloatingMenuButton = ({ options }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState(null);

  const floatingMenuRef = useRef(null);
  const {auth} = useAuth()

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (floatingMenuRef.current && !floatingMenuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleMouseMove = (e) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (text) => {
    setShowTooltip(true);
    setTooltipText(text);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setTooltipText(null);
  };

  return (
    <>
      <Tooltip showTooltip={showTooltip} tooltipPosition={tooltipPosition}>
        {tooltipText}
      </Tooltip>
      <div className="fixed bottom-4 right-4 text-white z-40" ref={floatingMenuRef}>
        <button className="floating-menu rounded-full w-16 h-16 flex items-center justify-center text-xl focus:outline-none" onClick={toggleOptions}>
          <span><FiMoreHorizontal style={{color:"white"}}/></span>
        </button>
        <div className={`absolute bottom-16 right-0 ${showOptions ? 'show' : 'hide'}`}>
          <ul>
            {options.map((option, index) => (
              (!option.minPermissionLevel || auth?.decoded?.permissionlevel >= option.minPermissionLevel) &&
                <li key={index} className="mb-2" onMouseEnter={() => handleMouseEnter(option.text)} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}>
                  <button style={{color:"white"}} className="floating-item rounded-full w-12 h-12 flex items-center justify-center text-lg focus:outline-none mr-2" onClick={option.action}>
                    {option.icon || option.text}
                  </button>
                </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default FloatingMenuButton;