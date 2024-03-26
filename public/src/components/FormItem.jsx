import React from 'react'
import FormError from './FormError'

export default function FormItem({labelName, type, inputName, value, handleChange, error}) {

  return (
    <>
        <label className="mb-1">{labelName}</label>
        <input type={type} name={inputName} value={value} onChange={handleChange} className={`w-full ${error && 'error-field'}`}  />
        <FormError error={error}/>
    </>
        
  )
}
