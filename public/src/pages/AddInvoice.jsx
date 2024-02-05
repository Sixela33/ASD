import React, { useState } from 'react';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';
import useAlert from '../hooks/useAlert';

import InvoiceDataForm from '../components/InvoiceCreation/InvoiceDataForm';
import InvoiceProjectSelector from '../components/InvoiceCreation/InvoiceProjectSelector';
import InvoiceFlowerAssignment from '../components/InvoiceCreation/InvoiceFlowerAssignment';
import { validateInvoice } from '../utls/validations/InvoiceDataValidations';

const emptyInvoiceObject = {
  invoiceNumber: '',
  vendor: '',
  dueDate: '',
  invoiceAmount: ''
};

export default function AddInvoice() {
  const {setMessage} = useAlert()

  const [pdfFile, setPdfFile] = useState(null);
  const [invoiceData, setFormData] = useState(emptyInvoiceObject);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
  };

  const handleChangeBaseInvoiceData = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...invoiceData,
      [name]: value,
    });
  };

  const handleVendorChange = (vendor) => {
    setFormData({
      ...invoiceData,
      'vendor': vendor["vendorid"]
    })
  }

  const handleContinueInvoiceDataForm = (e) => {
    e.preventDefault()
    const result = validateInvoice(invoiceData)

    if (result?.success) {
      handleNextStep()
    } else {
      setMessage("All values must be filled", true)
    }
  }

  const handleContinueProjectSelection = (e) => {
    e.preventDefault();
    if (selectedProjects.length == 0){
      setMessage('Please select a project to continue', true)
      return
    }
    handleNextStep()
  }

  const steps = [
    <InvoiceDataForm onSubmit={handleContinueInvoiceDataForm} invoiceData={invoiceData} handleChange={handleChangeBaseInvoiceData} handleVendorChange={handleVendorChange} />,
    <InvoiceProjectSelector goBack={handlePreviousStep} goNext={handleContinueProjectSelection} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} />,
    <InvoiceFlowerAssignment goBack={handlePreviousStep} chosenProjects={selectedProjects} invoiceData={invoiceData}/>
  ];

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

        <div className="w-1/2 px-4 h-1/2 my-10">
          {pdfFile ? steps[currentStep] : <p>Add a file to continue</p>}
        </div>
    </div>
  );
}
