import React from 'react'
import PopupBase from './PopupBase'
import LoadFlower from '../pages/Flowers/LoadFlower'

export default function CreateNewFlowerPopup({showPopup}) {
    
  return (
    <PopupBase showPopup={showPopup}>
        <LoadFlower/>
    </PopupBase>
  )
}
