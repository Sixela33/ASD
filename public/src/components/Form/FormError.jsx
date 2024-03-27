import React from 'react'

export default function FormError({error}) {
  return (
    <p className={error ? 'error-message' : 'opacity-0'}>{error || '.'}</p>                      

  )
}
