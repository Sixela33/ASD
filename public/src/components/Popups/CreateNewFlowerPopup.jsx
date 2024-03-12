import React from 'react'
import PopupBase from '../PopupBase'
import NewFlowerForm from '../NewFlowerForm'

export default function CreateNewFlowerPopup({showPopup, closePopup, flowerData}) {
    
  return (
    <PopupBase showPopup={showPopup}>
        <NewFlowerForm cancelButton={closePopup} flowerData={flowerData}/>
    </PopupBase>
  )
}
