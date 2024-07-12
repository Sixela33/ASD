import React, { useEffect, useRef, useState } from 'react';
import useAlert from '../../hooks/useAlert';
import { useParams } from 'react-router-dom';
import InvoiceDataForm from '../../components/InvoiceCreation/InvoiceDataForm';
import InvoiceProjectSelector from '../../components/InvoiceCreation/InvoiceProjectSelector';
import InvoiceFlowerAssignment from '../../components/InvoiceCreation/InvoiceFlowerAssignment';
import GoBackButton from '../../components/GoBackButton';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import LoadingPopup from '../../components/LoadingPopup';

const emptyInvoiceObject = {
  invoiceNumber: '',
  vendor: '',
  dueDate: new Date().toISOString().substring(0, 10),
  invoiceAmount: '',
};

const invoiceDataSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required('the invoice number is required').typeError('the invoice number is required'),
  vendor: Yup.number().required('The vendor field is required').typeError('The vendor field is required'),
  dueDate: Yup.date().min("1900-12-31").max("9999-12-31").required('The date is required'),
  invoiceAmount: Yup.number().required('The amount is required').typeError('The amount is required'),
  invoiceid: Yup.number().optional(),
  fileLocation: Yup.string().optional(),
})

const FETCH_INVOICE_DATA_URL = '/api/invoices/invoiceData/'
const SAVE_INCOMPLETE_INVOICE = '/api/invoices/incomplete'

export default function AddInvoice() {
  const {setMessage} = useAlert()
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate()
  const axiosPrivateImage = useAxiosPrivateImage()
  const navigateTo = useNavigate()

  const [pdfFile, setPdfFile] = useState(null);
  const [prevInvoiceFile, setPrevInvoiceFile] = useState(null)
  const [invoiceData, setFormData] = useState(emptyInvoiceObject);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [DisplayPdfFile, setDisplayPdfFile] = useState(null)

  const [invoiceFormErrors, setInvoiceFormErrors] = useState({})

  const [flowerData, setFlowerData] = useState([])
  const [selectedVendor, setSelectedVendor] = useState('');

  const [showLoadingInvoice, setShowLoadingInvoice] = useState(false)
  const isSendingRequest = useRef(false)

  const fetchProjectsProvided = async () => {
    
    try {
        const response = await axiosPrivate.get(FETCH_INVOICE_DATA_URL + id);
        let {flowers, invoiceData, projects} = response?.data
        
        invoiceData = invoiceData[0]

        setFormData({
          invoiceNumber: invoiceData.invoicenumber,
          vendor: invoiceData.vendorid,
          dueDate: invoiceData.invoicedate,
          invoiceAmount: invoiceData.invoiceamount,
          invoiceid: id,
          fileLocation: invoiceData.filelocation,
        })

        setSelectedVendor({"vendorid": invoiceData.vendorid, "vendorname": invoiceData.vendorname})

        setPrevInvoiceFile(invoiceData.filelocation)
        setSelectedProjects(projects)
        setFlowerData(flowers)
        
    } catch (error) {
        setMessage(error.response?.data, true);
    }
  }

  useEffect(() => {
    if(id) {
      fetchProjectsProvided()
    }
  }, [])

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
    setDisplayPdfFile(e.target.files[0] && URL.createObjectURL(e.target.files[0]) + '#toolbar=0')
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
    setSelectedVendor(vendor)
  }

  const handleContinueInvoiceDataForm = (e) => {
    e.preventDefault()  

    let schemaErrors = null

    try {
      invoiceDataSchema.validateSync(invoiceData, { abortEarly: false })
    } catch (err) {
        schemaErrors = {}
        err.inner.forEach(error => {
            schemaErrors[error.path] = error.message;
        });
    }

    if(schemaErrors) {
        setInvoiceFormErrors(schemaErrors)
        return
    } 

    setInvoiceFormErrors({})
    handleNextStep()

  }

  const handleContinueProjectSelection = (e) => {
    e.preventDefault();
    if (selectedProjects.length == 0){
      setMessage('Please select a project to continue', true)
      return
    }
    handleNextStep()
  }

  const saveIncompleteInvoice = async () => {
    
    let schemaErrors = null
    setShowLoadingInvoice(true)
    if (isSendingRequest.current) return

    isSendingRequest.current = true

    try {
      try {
        invoiceDataSchema.validateSync(invoiceData, { abortEarly: false })
      } catch (err) {
          schemaErrors = {}
          err.inner.forEach(error => {
              schemaErrors[error.path] = error.message;
          });
      }
  
      if(schemaErrors) {
          setInvoiceFormErrors(schemaErrors)
          return
      }
  
      setInvoiceFormErrors({})
  
      const formDataToSend = new FormData();
  
      formDataToSend.append('invoiceData', JSON.stringify(invoiceData));
      formDataToSend.append('invoiceFile', pdfFile);
  
      await axiosPrivateImage.post(SAVE_INCOMPLETE_INVOICE, formDataToSend)
      
      setMessage('Success', false)
      navigateTo('/invoice')
      
    } catch (error) {
      setMessage(error.response.data)
    } finally {
      setShowLoadingInvoice(false)
      isSendingRequest.current = false
    }
  }
  
  const steps = [
    <InvoiceDataForm onSubmit={handleContinueInvoiceDataForm} saveIncompleteInvoice={saveIncompleteInvoice} invoiceData={invoiceData} handleChange={handleChangeBaseInvoiceData} handleVendorChange={handleVendorChange} selectedVendor={selectedVendor} invoiceFormErrors={invoiceFormErrors}/>,
    <InvoiceProjectSelector goBack={handlePreviousStep} goNext={handleContinueProjectSelection} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} />,
    <InvoiceFlowerAssignment goBack={handlePreviousStep} chosenProjects={selectedProjects} invoiceData={invoiceData} invoiceFile={pdfFile} loadedFlowers={flowerData} setLoading={setShowLoadingInvoice}/>
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
