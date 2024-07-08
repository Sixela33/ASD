import React from 'react'

export default function LoadingPage() {
  return (
    <>
     <div className='flex flex-col items-center text-center '>
          <img src={spinnerSvg} className='w-[5vw]'/>
          <div className='my-5'>
              <h1>Loading</h1>
          </div>
      </div>
    </>
  )
}
