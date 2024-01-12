import React, { useState } from 'react';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';
import useAlert from '../hooks/useAlert';
import InvoiceDataForm from '../components/InvoiceDataForm';
import InvoiceFlowerAssignment from '../components/InvoiceFlowerAssignment';

const emptyInvoiceObject = {
  invoiceNumber: '',
  vendor: '',
  dueDate: ''
};

export default function AddInvoice() {
  const axiosPrivate = useAxiosPrivateImage();
  const { setMessage } = useAlert();

  const [pdfFile, setPdfFile] = useState(null);
  const [invoiceData, setFormData] = useState(emptyInvoiceObject);
  const [dataLoaded, setDataLoaded] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...invoiceData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(invoiceData);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setDataLoaded(!dataLoaded)
  }

  return (
    <div className="mx-auto mt-8 p-6 bg-white rounded-md shadow-md flex h-screen">
        <div className="w-1/2 px-auto">
            <div className="flex flex-col">
                <div className="flex flex-col mb-4">
                    <label className="mb-1">File:</label>
                    <input type="file" name="flower" onChange={handleFileChange} className="border border-gray-300 p-2 rounded" required/>
                </div>
                <div className="flex flex-row">
                    {pdfFile && (<embed src={URL.createObjectURL(pdfFile)+ '#toolbar=0'} type="application/pdf" width="100%" height="600vh"/>)}
                </div>
            </div>
        </div>

      <div className="w-1/2 px-4 h-1/2 my-auto">
        {!dataLoaded ? <>
        {pdfFile && <InvoiceDataForm onSubmit={handleContinue} invoiceData ={invoiceData} handleChange={handleChange}/>}
        </> : <InvoiceFlowerAssignment goBack={handleContinue}/>}
       </div>
    </div>
  );
}
