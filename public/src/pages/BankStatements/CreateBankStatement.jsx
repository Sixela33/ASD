import React, { useEffect, useRef, useState } from 'react';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';
import useAlert from '../../hooks/useAlert';
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage';
import SearchableDropdown from '../../components/Dropdowns/SearchableDropdown';
import FormItem from '../../components/Form/FormItem';
import FormError from '../../components/Form/FormError';
import { useNavigate } from 'react-router-dom';

const GET_VENDORS_URL = '/api/vendors';
const CREATE_BANK_STATEMENT_URL = '/api/bankStatements';

const DEFAULT_STATEMENT_DATA = {
  selectedVendor: '',
  selectedDate: ''
};

export default function CreateBankStatement({ editBankStatementData }) {
  const [statementData, setStatementData] = useState(editBankStatementData || DEFAULT_STATEMENT_DATA);
  const [displayPdfFile, setDisplayPdfFile] = useState(null);
  const [fileToSend, setFileToSend] = useState(null);
  const [vendors, setVendors] = useState([]);

  const [statementFormErrors, setStatementFormErrors] = useState({});

  const axiosPrivate = useAxiosPrivateImage();
  const { setMessage } = useAlert();
  const isSendingRequest = useRef(false);
  const navigateTo = useNavigate()

  const fetchVendors = async () => {
    try {
      const response = await axiosPrivate.get(GET_VENDORS_URL);
      setVendors(response.data);
    } catch (error) {
      setMessage(error.response?.data, true);
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (editBankStatementData) {
      setStatementData(editBankStatementData);
      setDisplayPdfFile(`${editBankStatementData.filelocation}#toolbar=0`);
    }
  }, [editBankStatementData]);

  const handleFormDataChange = (name, value) => {
    setStatementData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileToSend(file);
    if (displayPdfFile) {
      URL.revokeObjectURL(displayPdfFile);
    }
    setDisplayPdfFile(file ? URL.createObjectURL(file) + '#toolbar=0' : null);
  };

  const handleSubmit = async () => {
    if (isSendingRequest.current) return;

    isSendingRequest.current = true;

    try {
      if (!fileToSend) {
        setMessage("Please load a file");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('statementFile', fileToSend);

      const invoiceData = {
        vendorid: statementData.selectedVendor.vendorid,
        statementdate: statementData.selectedDate
      };

      if (statementData.statementid) {
        invoiceData.statementid = statementData.statementid;
        formDataToSend.append('statementData', JSON.stringify(invoiceData));
        const response = await axiosPrivate.patch(CREATE_BANK_STATEMENT_URL, formDataToSend);
        navigateTo('/')
      } else {
        formDataToSend.append('statementData', JSON.stringify(invoiceData));
        const response = await axiosPrivate.post(CREATE_BANK_STATEMENT_URL, formDataToSend);
        navigateTo('/bankStatement/link/' + response.data.statementid)

      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data, true);
    } finally {
      isSendingRequest.current = false;
    }
  };

  return (
    <div className='container mx-auto page pt-12 p-4 text-center'>
      <div className="mb-4 text-center">
          <h2>{statementData.BankStatementid ? "Edit Bank Statement" : "Add New Bank Statement"}</h2>
      </div>

      <div className="flex justify-center items-center mt-8">
        <div className="bg-white flex w-full">
            <div className="w-1/2 px-6 py-8">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col">
                    <label className="mb-1">Select or drop file:</label>
                    <input type="file" name="statementFile" onChange={handleFileChange} className="w-full" required />
                    </div>
                    <div className="flex flex-row">
                    {displayPdfFile && (
                        <embed src={displayPdfFile} type="application/pdf" width="100%" height="500px" />
                    ) }
                    </div>
                </div>
            </div>
            <div className="w-1/2 px-4 py-8">
            <div className="flex flex-col">
              <label>Select vendor</label>
              <SearchableDropdown
                  options={vendors || []}
                  label={'vendorname'}
                  selectedVal={statementData.selectedVendor}
                  handleChange={(vendor) => handleFormDataChange('selectedVendor', vendor)}
                  placeholderText="Select vendor"
                  disabled={statementData.statementid}
              />
              <FormError error={statementFormErrors.vendor} />
            </div>
            <div className="flex flex-col">
                <FormItem
                    labelName="Bank Statement date:"
                    type="date"
                    value={statementData.selectedDate}
                    handleChange={(e) => handleFormDataChange('selectedDate', e.target.value)}
                    error={statementFormErrors.statementdate}
                />
            </div>
            <button className='buton-main w-1/2' onClick={handleSubmit}>Save</button>
          </div>
      </div>
      </div>
  </div>
  );
}
