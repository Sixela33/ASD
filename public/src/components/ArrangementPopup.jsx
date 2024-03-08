import React from 'react';
import SearchableDropdown from './Dropdowns/SearchableDropdown';
import PopupBase from './PopupBase';

const ArrangementPopup = ({ showPopup, onClose, onSubmit, newArrangement, onInputChange, arrangementTypes }) => {
  return (
    <PopupBase showPopup={showPopup}>
        <h2>Add New Arrangement</h2>
        <div className='py-2'>
          <label >Type:</label>
          <SearchableDropdown options={arrangementTypes} label='typename' selectedVal={newArrangement.arrangementType} handleChange={(obj) => {console.log(obj); onInputChange('arrangementType', obj)}} placeholderText='Select Arrangement Type'/>
        </div>
        <div className='py-2'>
          <label >Description:</label>
          <input className='w-full' type="text" value={newArrangement.arrangementDescription} onChange={(e) => onInputChange('arrangementDescription', e.target.value)}  />
        </div>
        <div className='py-2'>
          <label >Client cost:</label>
          <input className='w-full' type="number" value={newArrangement.clientCost} onChange={(e) => onInputChange('clientCost', e.target.value)}  required />
        </div>
        <div className='py-2'>
          <label >Quantity:</label>
          <input className='w-full' type="number" value={newArrangement.arrangementQuantity} onChange={(e) => onInputChange('arrangementQuantity', e.target.value)}  required />
        </div>
        <div className='buttons-holder'>
          <button className='buton-main' onClick={onSubmit} >Add Arrangement</button>
          <button className='buton-secondary' onClick={onClose} >Close</button>
        </div>
      </PopupBase>
  );
};

export default ArrangementPopup;
