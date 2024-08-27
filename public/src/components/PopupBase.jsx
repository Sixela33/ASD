import React from 'react'

export default function PopupBase({ showPopup, children, closePopup, maxw }) {
  if (!closePopup) closePopup = () => {}
  if (!maxw) maxw = 'md'
  
  const handleClickOutside = (e) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  }

  return showPopup && (
    <div 
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-30" 
      onClick={handleClickOutside}
    >
      <div className={`bg-white p-6 rounded shadow-lg max-w-${maxw} w-full`}>
        {children}
      </div>
    </div>
  )
}
