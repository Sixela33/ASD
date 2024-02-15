import React from 'react';
import SearchableDropdown from './Dropdowns/SearchableDropdown';
import PopupBase from './PopupBase';

const ArrangementPopup = ({ showPopup, onClose, onSubmit, newArrangement, onInputChange, arrangementTypes }) => {
  return (
    <PopupBase showPopup={showPopup}>
        <h3 className="text-2xl font-semibold mb-4">Add New Arrangement</h3>

        {/* Arrangement form fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Type:</label>
          <SearchableDropdown options={arrangementTypes} label='typename' selectedVal={newArrangement.arrangementType} handleChange={(obj) => {console.log(obj); onInputChange('arrangementType', obj)}} placeholderText='Select Arrangement Type'/>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Description:</label>
          <input type="text" value={newArrangement.arrangementDescription} onChange={(e) => onInputChange('arrangementDescription', e.target.value)} className="mt-1 p-2 w-full border rounded focus:outline-none focus:border-blue-500" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Client cost:</label>
          <input type="number" value={newArrangement.clientCost} onChange={(e) => onInputChange('clientCost', e.target.value)} className="mt-1 p-2 w-full border rounded focus:outline-none focus:border-blue-500" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Quantity:</label>
          <input type="number" value={newArrangement.arrangementQuantity} onChange={(e) => onInputChange('arrangementQuantity', e.target.value)} className="mt-1 p-2 w-full border rounded focus:outline-none focus:border-blue-500" required />
        </div>
        <div className="flex justify-between">
          <button onClick={onSubmit} className="bg-black text-white px-4 py-2 rounded focus:outline-none">Add Arrangement</button>
          {/* Button to close the popup */}
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded focus:outline-none">Close</button>
        </div>
      </PopupBase>
  );
};

export default ArrangementPopup;
