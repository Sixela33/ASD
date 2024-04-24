import React from 'react'

export default function FormError({error}) {
  return (
    <div>
      <span className={error ? 'error-message' : 'opacity-0 '}>{error || '.'}</span>                      
    </div>

  )
}
