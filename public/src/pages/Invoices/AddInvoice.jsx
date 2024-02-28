import React, { useState } from 'react';
import useAlert from '../../hooks/useAlert';

import InvoiceDataForm from '../../components/InvoiceCreation/InvoiceDataForm';
import InvoiceProjectSelector from '../../components/InvoiceCreation/InvoiceProjectSelector';
import InvoiceFlowerAssignment from '../../components/InvoiceCreation/InvoiceFlowerAssignment';
import { validateInvoice } from '../../utls/validations/InvoiceDataValidations';
import GoBackButton from '../../components/GoBackButton';

const emptyInvoiceObject = {
  invoiceNumber: '',
  vendor: '',
  dueDate: new Date().toISOString().substring(0, 10),
  invoiceAmount: ''
};

export default function AddInvoice() {
  const {setMessage} = useAlert()

  const [pdfFile, setPdfFile] = useState(null);
  const [invoiceData, setFormData] = useState(emptyInvoiceObject);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [asrcPdfFile, setAsrcPdfFile] = useState(null)

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
 
  const handleFileChange = (e) => {
    e.preventDefault()
    const file = e.target.files[0];
    setPdfFile(file);
    setAsrcPdfFile(e.target.files[0] && URL.createObjectURL(e.target.files[0]) + '#toolbar=0')
  };

  const handleChangeBaseInvoiceData = (e) => {
    e.preventDefault()
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
    <InvoiceFlowerAssignment goBack={handlePreviousStep} chosenProjects={selectedProjects} invoiceData={invoiceData} invoiceFile={pdfFile}/>
  ];

  return (
    <div>
      <div className="text-center w-full">
        <GoBackButton />
        <h1 className="text-3xl font-bold">Load invoice</h1>
      </div>
      <div className="flex justify-center items-center mt-8">
        <div className="bg-white flex w-full">
          <div className="w-1/2 px-6 py-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="mb-1">Select or drop file: :</label>
                <input type="file" name="flower" onChange={handleFileChange} className="border border-gray-300 p-2 rounded" required />
              </div>
              <div className="flex flex-row">
                {asrcPdfFile && (
                  <embed src={asrcPdfFile} type="application/pdf" width="100%" height="500vh" />
                )}
              </div>
            </div>
          </div>

          <div className="w-1/2 px-4 py-8">
            {asrcPdfFile ? steps[currentStep] : <p>Add a file to continue</p>}
          </div>
        </div>
      </div>
    </div>

  );
}
