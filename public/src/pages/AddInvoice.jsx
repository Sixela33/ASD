import React, { useState } from 'react';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';
import useAlert from '../hooks/useAlert';

import InvoiceDataForm from '../components/InvoiceDataForm';
import InvoiceProjectSelector from '../components/InvoiceProjectSelector';
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
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectsSelected, setProjectsSelected] = useState(false)

  
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

  const handleContinueDataForm = (e) => {
    e.preventDefault();
    setDataLoaded(true)
  }

  const handleContinueProjectSelection = (e) => {
    e.preventDefault();
    if (selectedProjects.length == 0){
      setMessage('Please select a project to continue', true)
      return
    }
    console.log(selectedProjects)
    setProjectsSelected(true)
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

        <div className="w-1/2 px-4 h-1/2 my-10">

          {pdfFile ? (!dataLoaded ? (
            <InvoiceDataForm onSubmit={handleContinueDataForm} invoiceData={invoiceData} handleChange={handleChange} />
          ) : !projectsSelected ? (
            <InvoiceProjectSelector goBack={() => setDataLoaded(false)} goNext={handleContinueProjectSelection} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} />
          ) : <InvoiceFlowerAssignment goBack={() => setProjectsSelected(false)} chosenProjects={selectedProjects}/>): <p>?</p> }
      </div>
    </div>
  );
}
