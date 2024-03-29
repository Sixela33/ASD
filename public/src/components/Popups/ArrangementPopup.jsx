import React from 'react';
import SearchableDropdown from '../Dropdowns/SearchableDropdown';
import PopupBase from '../PopupBase';
import FormItem from '../Form/FormItem';
import FormError from '../Form/FormError';

const ArrangementPopup = ({ showPopup, onClose, onSubmit, newArrangement, onInputChange, arrangementTypes, newArrangementErrors }) => {
  return (
    <PopupBase showPopup={showPopup}>
        <h2>Add New Arrangement</h2>
        <div>
          <label >Type:</label>
          <SearchableDropdown options={arrangementTypes} label='typename' selectedVal={newArrangement.arrangementType} handleChange={(obj) => {onInputChange('arrangementType', obj)}} placeholderText='Select Arrangement Type'/>
          <FormError error={newArrangementErrors.arrangementType}/>                       

        </div>
        <div >
            <FormItem
            labelName="Description:"
            type="text"
            inputName="arrangementDescription"
            value={newArrangement.arrangementDescription}
            handleChange={(e) => onInputChange('arrangementDescription', e.target.value)}
            error={newArrangementErrors.arrangementDescription}
          />
        </div>
        <div>
          <FormItem
            labelName="Client cost:"
            type="number"
            inputName="clientCost"
            value={newArrangement.clientCost}
            handleChange={(e) => onInputChange('clientCost', e.target.value)}
            error={newArrangementErrors.clientCost}
          />                      

        </div>
        <div>
          <FormItem
            labelName="Quantity:"
            type="number"
            inputName="arrangementQuantity"
            value={newArrangement.arrangementQuantity}
            handleChange={(e) => onInputChange('arrangementQuantity', e.target.value)}
            error={newArrangementErrors.arrangementQuantity}
          />
        </div>
        <div className='buttons-holder'>
          <button className='buton-main' onClick={onSubmit} >Add Arrangement</button>
          <button className='buton-secondary' onClick={onClose} >Close</button>
        </div>
      </PopupBase>
  );
};

export default ArrangementPopup;
