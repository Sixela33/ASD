import React from 'react'
import LoadingPopup from '../components/LoadingPopup'

export default function LoadingPage() {
  return (
    <div className='page'>
        <LoadingPopup>
            <h1>Loading...</h1>
        </LoadingPopup>
    </div>
  )
}
