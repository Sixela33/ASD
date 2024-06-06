import React from 'react'
import PopupBase from '../PopupBase'


export default function ConfirmationPopup({showPopup, closePopup, confirm, children}) {

  const confirmFunc = () => {
    confirm()
    closePopup()
  }

  return (
    <PopupBase 
      showPopup={showPopup}
      closePopup={closePopup}>
        {children}
        <div className='buttons-holder'>
            <button onClick={closePopup} className='buton-secondary'>Cancel</button>
            <button onClick={confirmFunc} className='buton-main'>Confirm</button>
        </div>
    </PopupBase>
  )
}
