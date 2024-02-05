import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import SearchableDropdown from '../SearchableDropdown';

const GET_VENDORS_URL = '/api/vendors';

export default function InvoiceDataForm({ onSubmit, invoiceData, handleChange, handleVendorChange }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
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
    setSelectedVendor(vendor)
    handleVendorChange(vendor)
  }


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Invoice Data</h2>
      <form className="space-y-4">
        <div className="flex flex-col mb-4">
          <SearchableDropdown options={vendors} label={'vendorname'} selectedVal={selectedVendor} handleChange={(vendor)=> {handleSelectVendor(vendor)}} placeholderText="Select vendor"/>
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1">Invoice Number:</label>
          <input type="text" name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleChange} className="border border-gray-300 p-2 rounded" required />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1">Due Date:</label>
          <input type="date" name="dueDate" value={invoiceData.dueDate} onChange={handleChange} className="border border-gray-300 p-2 rounded" required />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1">Invoice Amount:</label>
          <input type="number" name="invoiceAmount" value={invoiceData.invoiceAmount} onChange={handleChange} className="border border-gray-300 p-2 rounded" required />
        </div>
        <button onClick={onSubmit} className="bg-black text-white font-bold py-2 px-4 rounded">
          Continue
        </button>
      </form>
    </div>
  );
}
