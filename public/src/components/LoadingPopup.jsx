import React from 'react'
import PopupBase from './PopupBase'
import spinnerSvg from '/spinner.svg'

export default function LoadingPopup({showPopup, children}) {
    return (
        <PopupBase showPopup={showPopup}>
            <div className='flex flex-col items-center text-center '>
                <img src={spinnerSvg} className='w-[5vw]'/>
                <div className='my-5'>
                    {children}
                </div>
            </div>
        </PopupBase>
    )
}
