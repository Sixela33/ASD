import React from 'react'
import PopupBase from './PopupBase'


export default function ConfirmationPopup({showPopup, closePopup, confirm, children}) {

  const submitFUnc = () => {
    confirm()
    closePopup()
  }

  return (
    <PopupBase showPopup={showPopup}>
        {children}
        <div>
            <button onClick={closePopup} className='mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400'>Cancel</button>
            <button onClick={submitFUnc} className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600'>Confirm</button>
        </div>
    </PopupBase>
  )
}
