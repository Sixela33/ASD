import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import InvoiceBaseDataForm from './invoiceBaseDataForm';
import LoadingPopup from '../../../components/LoadingPopup';
import GoBackButton from '../../../components/GoBackButton';
import AddFlowers from './AddFlowers';

const emptyInvoiceObject = {
  invoiceNumber: '',
  vendor: '',
  dueDate: new Date().toISOString().substring(0, 10),
  invoiceAmount: '',
};

export default function AddInvoice() {
  const { id } = useParams();

  const [pdfFile, setPdfFile] = useState(null);
  const [prevInvoiceFile, setPrevInvoiceFile] = useState(null)
  const [invoiceData, setFormData] = useState(emptyInvoiceObject);
  const [currentStep, setCurrentStep] = useState(0);
  const [DisplayPdfFile, setDisplayPdfFile] = useState(null)
  const [showLoadingInvoice, setShowLoadingInvoice] = useState(false)

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
 
  const handleFileChange = (e) => {
    e.preventDefault()
    const file = e.target.files[0];
    console.log(file)
    setPdfFile(file);
    setDisplayPdfFile(e.target.files[0] && URL.createObjectURL(e.target.files[0]) + '#toolbar=0')
  };

  
  const steps = [
    <InvoiceBaseDataForm 
      invoiceData={invoiceData} 
      setFormData={setFormData}
      pdfFile = {pdfFile}
      setShowLoading={setShowLoadingInvoice}
      handleContinue={handleNextStep}
      handlePrevious={handlePreviousStep}
    />,
    <AddFlowers/>
 ];

  return (
  <div>
    <LoadingPopup
      showPopup={showLoadingInvoice}>
        <h1>Loading your invoice!</h1>
        <h2>Please wait</h2>
    </LoadingPopup>
    <div className='container mx-auto page pt-12 p-4 text-center'>
      <div className="grid grid-cols-3 mb-4">
        <GoBackButton className='col-span-1'/>
        <h1 className='col-span-1'>Add New Invoice</h1>
      </div>
      <div className="flex justify-center items-center mt-8">
        <div className="bg-white flex w-full">
          <div className="w-1/2 px-6 py-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="mb-1">Select or drop file: :</label>
                <input type="file" name="flower" onChange={handleFileChange} className="w-full" required />
              </div>
              <div className="flex flex-row">
                {DisplayPdfFile ? (
                  <embed src={DisplayPdfFile} type="application/pdf" width="100%" height="500vh" />
                ): prevInvoiceFile && <embed src={`${prevInvoiceFile}#toolbar=0`} type="application/pdf" width="100%" height="500vh"/> && 'file not found'}
              </div>
            </div>
          </div>

          <div className="w-1/2 px-4 py-8">
            {DisplayPdfFile || prevInvoiceFile ? steps[currentStep] : <p>Add a file to continue</p>}
          </div>
        </div>
      </div>
    </div>
  </div>

  );
}
