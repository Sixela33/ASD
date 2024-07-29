import React from 'react';
import FormError from './FormError';
import './item-css.css'; // Assuming you create a CSS file for styling

export default function FormItem({ labelName, type, inputName, value, handleChange, error, step, isCurrency }) {
  if (!handleChange) handleChange = () => {};
  if (!type) type = "text";
  if (!inputName) inputName = "";
  if (!labelName) labelName = "";
  if (!value) value = "";
  if (!step) step = "1";

  return (
    <>
      <label className="mb-1">{labelName}</label>
      <div className='input-wrapper'>
        {isCurrency && <span className='currency-symbol'>$</span>}
        <input
          type={type}
          name={inputName}
          value={value}
          onChange={handleChange}
          className={`input-field ${error ? 'error-field' : ''}`}
          step={step}
        />
      </div>
      <FormError error={error} />
    </>
  );
}
