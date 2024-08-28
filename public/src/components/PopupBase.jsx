import React from 'react'

const maxWidthClasses = {
  '[50%]': 'max-w-[50%]',
  md: 'max-w-md',
};

export default function PopupBase({ showPopup, children, closePopup, maxw = 'md' }) {
  if (!closePopup) closePopup = () => {}
  
  const handleClickOutside = (e) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  const maxWidthClass = maxWidthClasses[maxw] || maxWidthClasses.md;

  return showPopup && (
    <div 
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-30" 
      onClick={handleClickOutside}
    >
      <div className={`bg-white p-6 rounded shadow-lg ${maxWidthClass} w-full`}>
        {children}
      </div>
    </div>
  );
}