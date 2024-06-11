import React from 'react'
import FormError from './FormError'

export default function FormItem({labelName, type, inputName, value, handleChange, error, step}) {
  if(!handleChange) handleChange = () => {}
  if(!type) type = "text"
  if(!inputName) inputName = ""
  if(!labelName) labelName = ""
  if(!value) value = ""
  if(!step) step = "1"


  return (
    <>
      <label className="mb-1">{labelName}</label>
      <input type={type} name={inputName} value={value} onChange={handleChange} className={`w-full ${error && 'error-field'}`} step={step} />
      <FormError error={error}/>
    </>
  )
}
