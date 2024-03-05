import React, { useEffect, useState } from 'react';
import useAlert from '../../hooks/useAlert';
import { useParams } from 'react-router-dom';
import InvoiceDataForm from '../../components/InvoiceCreation/InvoiceDataForm';
import InvoiceProjectSelector from '../../components/InvoiceCreation/InvoiceProjectSelector';
import InvoiceFlowerAssignment from '../../components/InvoiceCreation/InvoiceFlowerAssignment';
import { validateInvoice } from '../../utls/validations/InvoiceDataValidations';
import GoBackButton from '../../components/GoBackButton';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { BASE_URL } from '../../api/axios';
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage';
import { useNavigate } from 'react-router-dom';

const emptyInvoiceObject = {
  invoiceNumber: '',
  vendor: '',
  dueDate: new Date().toISOString().substring(0, 10),
  invoiceAmount: ''
};

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

  const [flowerData, setFlowerData] = useState([])
  const [selectedVendor, setSelectedVendor] = useState('');

  const fetchProjectsProvided = async () => {
    
    try {
        const response = await axiosPrivate.get(FETCH_INVOICE_DATA_URL + id);
        let {flowers, invoiceData, projects} = response?.data
        
        invoiceData = invoiceData[0]
        console.log(invoiceData)
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
    console.log('id', id)
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
    console.log("vendor", vendor)
    setSelectedVendor(vendor)
  }

  const handleContinueInvoiceDataForm = (e) => {
    e.preventDefault()

    const result = validateInvoice(invoiceData)

    if (result?.success) {
      handleNextStep()
    } else {
      setMessage(result.message, true)
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

  const saveIncompleteInvoice = async () => {
    
    const formDataToSend = new FormData();

    formDataToSend.append('invoiceData', JSON.stringify(invoiceData));
    formDataToSend.append('invoiceFile', pdfFile);

    await axiosPrivateImage.post(SAVE_INCOMPLETE_INVOICE, formDataToSend);
    
    setMessage('Success', false)
    navigateTo('/invoice')
    
  }
  

  const steps = [
    <InvoiceDataForm onSubmit={handleContinueInvoiceDataForm} saveIncompleteInvoice={saveIncompleteInvoice} invoiceData={invoiceData} handleChange={handleChangeBaseInvoiceData} handleVendorChange={handleVendorChange} selectedVendor={selectedVendor}/>,
    <InvoiceProjectSelector goBack={handlePreviousStep} goNext={handleContinueProjectSelection} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} />,
    <InvoiceFlowerAssignment goBack={handlePreviousStep} chosenProjects={selectedProjects} invoiceData={invoiceData} invoiceFile={pdfFile} loadedFlowers={flowerData}/>
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
                {DisplayPdfFile ? (
                  <embed src={DisplayPdfFile} type="application/pdf" width="100%" height="500vh" />
                ): prevInvoiceFile && <embed src={`${BASE_URL}/api/${prevInvoiceFile}#toolbar=0`} type="application/pdf" width="100%" height="500vh"/>}
              </div>
            </div>
          </div>

          <div className="w-1/2 px-4 py-8">
            {DisplayPdfFile || prevInvoiceFile ? steps[currentStep] : <p>Add a file to continue</p>}
          </div>
        </div>
      </div>
    </div>

  );
}
