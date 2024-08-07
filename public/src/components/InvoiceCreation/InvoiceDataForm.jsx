import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import SearchableDropdown from '../Dropdowns/SearchableDropdown';
import FormItem from '../Form/FormItem';
import FormError from '../Form/FormError';

const GET_VENDORS_URL = '/api/vendors';

export default function InvoiceDataForm({ onSubmit, saveIncompleteInvoice, invoiceData, handleChange, handleVendorChange, selectedVendor, invoiceFormErrors }) {
  const [vendors, setVendors] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const { setMessage } = useAlert();

  const fetchVendors = async () => {
    try {
      const response = await axiosPrivate.get(GET_VENDORS_URL);
      setVendors(response?.data);
    } catch (error) {
      setMessage(error.response?.data, true);
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
      <form className="space-y-2">
        <div className="flex flex-col">
          <SearchableDropdown options={vendors || []} label={'vendorname'} selectedVal={selectedVendor} handleChange={(vendor)=> {handleSelectVendor(vendor)}} placeholderText="Select vendor"/>
          <FormError error={invoiceFormErrors.vendor}/>
          </div>
        <div className="flex flex-col">
          <FormItem labelName="Invoice Number:" inputName="invoiceNumber" type="text" value={invoiceData.invoiceNumber} handleChange={handleChange} error={invoiceFormErrors.invoiceNumber} />
        </div>
        <div className="flex flex-col">
          <FormItem labelName="Invoice Date:" inputName="dueDate" type="date" value={invoiceData.dueDate} handleChange={handleChange} error={invoiceFormErrors.dueDate} />
        </div>
        <div className="flex flex-col">
          <FormItem isCurrency={true} labelName="Invoice Amount:" inputName="invoiceAmount" type="number" value={invoiceData.invoiceAmount} handleChange={handleChange} error={invoiceFormErrors.invoiceAmount} />
        </div>
        <div className='butons-holder'>
          <button className='buton-secondary' onClick={(e) =>  {e.preventDefault(); saveIncompleteInvoice()}} >Save Incomplete invoice</button>
          <button className='buton-main' onClick={onSubmit} >Continue</button> 
        </div>
      </form>
    </div>
  );
}
