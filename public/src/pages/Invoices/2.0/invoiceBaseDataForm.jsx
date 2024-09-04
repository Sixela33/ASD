import React, { useEffect, useCallback, useState } from 'react'
import * as Yup from 'yup';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import useAlert from '../../../hooks/useAlert';
import SearchableDropdown from '../../../components/Dropdowns/SearchableDropdown';
import FormError from '../../../components/Form/FormError';
import FormItem from '../../../components/Form/FormItem';

const GET_VENDORS_URL = '/api/vendors';

const invoiceDataSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required('Invoice number is required'),
  vendor: Yup.number().required('Vendor is required'),
  dueDate: Yup.date().min("1900-12-31", "Date is too early").max("9999-12-31", "Date is too far in the future").required('Date is required'),
  invoiceAmount: Yup.number().positive('Amount must be positive').required('Amount is required'),
  invoiceid: Yup.number().optional(),
  fileLocation: Yup.string().optional(),
})

export default function InvoiceBaseDataForm({ invoiceData, setFormData, handleContinue, handlePrevious, saveInvoiceData }) {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [errors, setErrors] = useState({});

    const axiosPrivate = useAxiosPrivate();

    const { setMessage } = useAlert();

    const fetchVendors = useCallback(async () => {
        try {
            const response = await axiosPrivate.get(GET_VENDORS_URL);
            setVendors(response?.data || []);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error fetching vendors', true);
            console.error('Error fetching vendors:', error);
        }
    }, [axiosPrivate, setMessage]);

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleChangeBaseInvoiceData = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    }, [setFormData]);
    
    const handleVendorChange = useCallback((vendor) => {
        setFormData(prevData => ({
            ...prevData,
            vendor: vendor.vendorid
        }));
        setSelectedVendor(vendor);
    }, [setFormData]);

    const validateForm = useCallback(async () => {
        try {
            await invoiceDataSchema.validate(invoiceData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (yupError) {
            const validationErrors = {};
            if (yupError.inner) {
                yupError.inner.forEach((error) => {
                    validationErrors[error.path] = error.message;
                });
            }
            setErrors(validationErrors);
            return false;
        }
    }, [invoiceData]);

  const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const isValid = await validateForm();
        if (isValid) {
            await saveInvoiceData();
        } else {
            setMessage("Please correct the errors before submitting.", true);
        }
    }, [validateForm, saveInvoiceData, setMessage]);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className='text-2xl font-bold mb-6'>Invoice Data</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex flex-col">
                    <SearchableDropdown 
                      options={vendors} 
                      label={'vendorname'} 
                      selectedVal={selectedVendor} 
                      handleChange={handleVendorChange} 
                      placeholderText="Select vendor"
                    />
                    <FormError error={errors.vendor}/>
                </div>
                <FormItem 
                    labelName="Invoice Number" 
                    inputName="invoiceNumber" 
                    type="text" 
                    value={invoiceData.invoiceNumber} 
                    handleChange={handleChangeBaseInvoiceData} 
                    error={errors.invoiceNumber} 
                />
                <FormItem 
                    labelName="Invoice Date" 
                    inputName="dueDate" 
                    type="date" 
                    value={invoiceData.dueDate} 
                    handleChange={handleChangeBaseInvoiceData} 
                    error={errors.dueDate} 
                />
                <FormItem 
                    isCurrency={true} 
                    labelName="Invoice Amount" 
                    inputName="invoiceAmount" 
                    type="number" 
                    value={invoiceData.invoiceAmount} 
                    handleChange={handleChangeBaseInvoiceData} 
                    error={errors.invoiceAmount} 
                />
                <div className='butons-holder'>
                  <button 
                    className='buton-secondary' 
                    onClick={(e) => { e.preventDefault(); saveInvoiceData(false)}}
                  >
                    Save Incomplete Invoice
                  </button>
                  <button 
                    className='buton-main' 
                    type="submit"
                    onClick={e => {
                      e.preventDefault(); 
                      saveInvoiceData(true)
                    }}
                  >
                    {'Submit'}
                  </button> 
                </div>
            </form>
        </div>
    )
}