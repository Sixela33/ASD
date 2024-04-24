import React from 'react'
import PopupBase from '../PopupBase'

export default function RedirectToFilePopup({showPopup, closePopup, url}) {
  return (
    <PopupBase
        showPopup={showPopup}>
        <h1>Your document has been created!</h1>
        <p>If you where not redirected click this link: </p>
        <a href={url} target="_blank" className='go-back-button'>Redirect me!</a>
        <br />
        <button onClick={closePopup} className='buton-main mt-4'>Close</button>
    </PopupBase>
  )
}
