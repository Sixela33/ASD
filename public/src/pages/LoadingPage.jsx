import React from 'react'
import spinnerSvg from '/spinner.svg'

export default function LoadingPage() {
  return (
    <>
     <div className='flex flex-col items-center text-center my-auto py-[30vh]'>
          <img src={spinnerSvg} className='w-[5vw]'/>
          <div className='my-5'>
              <h1>Loading...</h1>
          </div>
      </div>
    </>
  )
}
