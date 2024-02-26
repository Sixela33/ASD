import React from 'react'

export default function PopupBase({showPopup, children }) {
  return showPopup && (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        {children}
      </div>
    </div>
  )
}
