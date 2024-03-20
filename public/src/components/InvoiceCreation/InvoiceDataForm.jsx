import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import SearchableDropdown from '../Dropdowns/SearchableDropdown';

const GET_VENDORS_URL = '/api/vendors';

export default function InvoiceDataForm({ onSubmit, saveIncompleteInvoice, invoiceData, handleChange, handleVendorChange, selectedVendor }) {
  const [vendors, setVendors] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const { setMessage } = useAlert();

  const fetchVendors = async () => {
    try {
      const response = await axiosPrivate.get(GET_VENDORS_URL);
      setVendors(response?.data);
    } catch (error) {
      setMessage(error.response?.data?.message, true);
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSelectVendor = (vendor) => {
    handleVendorChange(vendor)
  }


  return (
    <div>
      <h2 className='mb-4'>Invoice Data</h2>
      <form className="space-y-4">
        <div className="flex flex-col mb-4">
          <SearchableDropdown options={vendors} label={'vendorname'} selectedVal={selectedVendor} handleChange={(vendor)=> {handleSelectVendor(vendor)}} placeholderText="Select vendor"/>
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1">Invoice Number:</label>
          <input type="text" name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleChange} className="w-full" required />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1">Invoice Date:</label>
          <input type="date" name="dueDate" value={invoiceData.dueDate} onChange={handleChange} className="w-full" required />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1">Invoice Amount:</label>
          <input type="number" name="invoiceAmount" value={invoiceData.invoiceAmount} onChange={handleChange} className="w-full" required />
        </div>
        <div className='buttons-holder'>
          <button className='buton-main' onClick={onSubmit} >
            Continue
          </button> 
          <button className='buton-secondary' onClick={(e) =>  {e.preventDefault(); saveIncompleteInvoice()}} >
            Save Incomplete invoice
          </button>
        </div>
      </form>
    </div>
  );
}
