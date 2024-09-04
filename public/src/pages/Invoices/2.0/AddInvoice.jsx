import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import InvoiceBaseDataForm from './invoiceBaseDataForm';
import LoadingPopup from '../../../components/LoadingPopup';
import GoBackButton from '../../../components/GoBackButton';
import AddFlowers from './AddFlowers';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import useAxiosPrivateImage from '../../../hooks/useAxiosPrivateImage';
import useAlert from '../../../hooks/useAlert';

const emptyInvoiceObject = {
  invoiceNumber: '',
  vendor: '',
  dueDate: new Date().toISOString().substring(0, 10),
  invoiceAmount: '',
};

const SAVE_INVOICE_DATA_URL = '/api/invoices/incomplete';

const invoiceDataSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required('The invoice number is required').typeError('The invoice number is required'),
  vendor: Yup.number().required('The vendor field is required').typeError('The vendor field is required'),
  dueDate: Yup.date().min("1900-12-31").max("9999-12-31").required('The date is required'),
  invoiceAmount: Yup.number().required('The amount is required').typeError('The amount is required'),
  invoiceid: Yup.number().optional(),
  fileLocation: Yup.string().optional(),
});

export default function AddInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const axiosPrivateImage = useAxiosPrivateImage();
  const {setMessage} = useAlert()

  const [pdfFile, setPdfFile] = useState(null);
  const [prevInvoiceFile, setPrevInvoiceFile] = useState(null)
  const [invoiceData, setFormData] = useState(emptyInvoiceObject);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayPdfFile, setDisplayPdfFile] = useState(null)
  const [showLoadingInvoice, setShowLoadingInvoice] = useState(false)
  const [invoiceFlowers, setInvoiceFlowers] = useState([])
  const [invoiceID, setInvoiceID] = useState(id)

  useEffect(() => {
    const fetchExistingFlowers = async () => {
      try {
        const response = await axiosPrivate.get(`/api/invoices/flowers/${id}`);
        setInvoiceFlowers(response.data);
      } catch (error) {
        console.error('Error fetching existing flowers:', error);
        setMessage('Failed to load existing flowers');
      }
    };

    if (id) {
      fetchExistingFlowers();
    }
  }, [id, axiosPrivate]);

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
    setDisplayPdfFile(file && URL.createObjectURL(file) + '#toolbar=0')
  };

  const saveInvoiceData = useCallback(async (shouldContinue) => {
    if (showLoadingInvoice) return;
    setShowLoadingInvoice(true);

    const isValid = await invoiceDataSchema.isValid(invoiceData);
    if (!isValid) {
      setMessage("Please correct the errors before saving.");
      setShowLoadingInvoice(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('invoiceData', JSON.stringify(invoiceData));
      formDataToSend.append('invoiceFile', pdfFile);

      const response = await axiosPrivateImage.post(SAVE_INVOICE_DATA_URL, formDataToSend);
      setInvoiceID(response.data.id)
      setMessage('Invoice saved successfully');
      
      if (shouldContinue) {
        handleNextStep();
      } else {
        navigate('/invoice');
      }
    } catch (error) {
      setMessage(error.response?.data || 'Error saving invoice');
    } finally {
      setShowLoadingInvoice(false);
    }
  }, [invoiceData, pdfFile, axiosPrivateImage, navigate, showLoadingInvoice]);

  const steps = [
    <InvoiceBaseDataForm 
      invoiceData={invoiceData} 
      setFormData={setFormData}
      pdfFile={pdfFile}
      setShowLoading={setShowLoadingInvoice}
      saveInvoiceData={saveInvoiceData}
      handleContinue={handleNextStep}
      handlePrevious={handlePreviousStep}
    />,
    <AddFlowers flowers={invoiceFlowers} invoiceID={invoiceID} />
  ];

  return (
    <div>
      <LoadingPopup showPopup={showLoadingInvoice}>
        <h1>Loading your invoice!</h1>
        <h2>Please wait</h2>
      </LoadingPopup>
      <div className="container mx-auto page pt-12 p-4 text-center">
        <div className="grid grid-cols-3 mb-4">
          <GoBackButton className='col-span-1' />
          <h1 className='col-span-1'>Add New Invoice</h1>
        </div>
        <div className="flex justify-center items-center mt-8">
          <div className="bg-white flex w-full">
            <div className="w-1/2 px-6 py-8">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col">
                  <label className="mb-1">Select or drop file:</label>
                  <input 
                    type="file" 
                    name="flower" 
                    onChange={handleFileChange} 
                    className="w-full" 
                    required 
                  />
                </div>
                <div className="flex flex-row">
                  {displayPdfFile ? (
                    <embed src={displayPdfFile} type="application/pdf" width="100%" height="500vh" />
                  ) : (
                    prevInvoiceFile && (
                      <embed src={`${prevInvoiceFile}#toolbar=0`} type="application/pdf" width="100%" height="500vh" />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="w-1/2 px-4 py-8">
              {displayPdfFile || prevInvoiceFile ? steps[currentStep] : <p>Add a file to continue</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
