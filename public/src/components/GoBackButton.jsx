import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function GoBackButton() {
    const navigateTo = useNavigate();

  return (
    <button className='go-back-button' onClick={() => navigateTo(-1)} >Go Back</button>
  )
}
