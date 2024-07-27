import React, { useEffect, useRef, useState } from 'react';
import useAlert from '../../hooks/useAlert';
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage';
import SearchableDropdown from '../../components/Dropdowns/SearchableDropdown';
import FormItem from '../../components/Form/FormItem';
import FormError from '../../components/Form/FormError';
import { useNavigate, useParams } from 'react-router-dom';
import Joi from 'joi';

const GET_VENDORS_URL = '/api/vendors';
const GET_BANK_STATEMENT_URL = '/api/bankStatements/byID/'
const CREATE_BANK_STATEMENT_URL = '/api/bankStatements'

const DEFAULT_STATEMENT_DATA = {
  selectedVendor: '',
  selectedDate: ''
};

const statementSchema = Joi.object({
  vendorid: Joi.number().required().label('Vendor'),
  statementdate: Joi.date().required().label('Date'),
  statementid: Joi.number().optional()
})

export default function CreateBankStatement() {
  const { id } = useParams();
  const [statementData, setStatementData] = useState(DEFAULT_STATEMENT_DATA);
  const [displayPdfFile, setDisplayPdfFile] = useState(null);
  const [fileToSend, setFileToSend] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [statementFormErrors, setStatementFormErrors] = useState({});
  const axiosPrivate = useAxiosPrivateImage();
  const { setMessage } = useAlert();
  const isSendingRequest = useRef(false);
  const navigateTo = useNavigate();

  const fetchVendors = async () => {
    try {
      const response = await axiosPrivate.get(GET_VENDORS_URL);
      setVendors(response.data);
    } catch (error) {
      setMessage(error.response?.data, true);
      console.error('Error fetching vendors:', error)
    }
  };

  const fetchStatementData = async () => {
    try {
      const response = await axiosPrivate.get(GET_BANK_STATEMENT_URL + id)
      console.log(response.data)
      setStatementData({
        selectedVendor: {
          vendorid: response.data.vendorid,
          vendorname: response.data.vendorname
        },
        selectedDate: response.data.statementdate,
        statementid: response.data.statementid
      })
      setDisplayPdfFile(`${response.data.filelocation}#toolbar=0`)
    } catch (error) {
      setMessage(error.response?.data, true)
      console.error('Error fetching statement data:', error)
    }
  };

  useEffect(() => {
    fetchVendors();
    if (id) {
      fetchStatementData()
    }
  }, [id]);

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

  const validateStatementData = (data) => {
    const { error } = statementSchema.validate(data, { abortEarly: false });
    if (error) {
        const errors = error.details.reduce((acc, curr) => {
            acc[curr.path[0]] = curr.message;
            return acc;
        }, {});
        setStatementFormErrors(errors);
        return false;
    }
    setStatementFormErrors({});
    return true;
};

  const handleSubmit = async () => {
    if (isSendingRequest.current) return;

    isSendingRequest.current = true;

    try {
      const formDataToSend = new FormData();
      
      if (!fileToSend && !statementData.statementid) {
        setMessage("Please load a file");
        return;
      } else if (fileToSend){
        formDataToSend.append('statementFile', fileToSend);
      }

      const tempStatementData = {
        vendorid: statementData.selectedVendor.vendorid,
        statementdate: statementData.selectedDate,
        statementid: statementData.statementid
      };

      if (!validateStatementData(tempStatementData)) {
        return;
    }

      if (tempStatementData.statementid) {
        formDataToSend.append('statementData', JSON.stringify(tempStatementData));
        await axiosPrivate.patch(CREATE_BANK_STATEMENT_URL, formDataToSend);
        navigateTo('/bankStatement/' + tempStatementData.statementid)
      } else {
        formDataToSend.append('statementData', JSON.stringify(tempStatementData));
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
        <h2>{statementData.statementid ? "Edit Bank Statement" : "Add New Bank Statement"}</h2>
      </div>
      <div className="flex justify-center items-center mt-8">
        <div className="bg-white flex w-full">
          <div className="w-1/2 px-6 py-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="mb-1">Upload File:</label>
                <input type="file" name="statementFile" onChange={handleFileChange} className="w-full" required />
              </div>
              <div className="flex flex-row">
                {displayPdfFile && (
                  <embed src={displayPdfFile} type="application/pdf" width="100%" height="500px" />
                )}
              </div>
            </div>
          </div>
          <div className="w-1/2 px-4 py-8">
            <div className="flex flex-col">
              <label>Select Vendor</label>
              <SearchableDropdown
                options={vendors || []}
                label={'vendorname'}
                selectedVal={statementData.selectedVendor}
                handleChange={(vendor) => handleFormDataChange('selectedVendor', vendor)}
                placeholderText="Select Vendor"
                disabled={statementData.statementid}
              />
              <FormError error={statementFormErrors.vendorid} />
            </div>
            <div className="flex flex-col">
              <FormItem
                labelName="Bank Statement Date:"
                type="date"
                value={statementData.selectedDate}
                handleChange={(e) => handleFormDataChange('selectedDate', e.target.value)}
                error={statementFormErrors.statementdate}
              />
            </div>
            <button className='buton-main w-1/2' onClick={handleSubmit}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}
