import React, { useEffect, useState } from 'react';
import useAlert from '../../hooks/useAlert';
import { useParams } from 'react-router-dom';
import GoBackButton from '../../components/GoBackButton';
import LinkBankTransaction from './steps/LinkBankTransaction';
import LinkTransactionsToInvoices from './steps/LinkTransactionsToInvoices';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const FETCH_STATEMENT_DATA = '/api/bankStatements/byID/'

export default function LinkBankStatement() {
  const {setMessage} = useAlert()
  const axiosPrivate = useAxiosPrivate()
  let { id } = useParams();

  const [DisplayPdfFile, setDisplayPdfFile] = useState(null)
  const [currentStep, setCurrentstep] = useState(0)
  const [bankStatementData, setBankStatementData] = useState(null)
  const [selectedBankTransaction, setSelectedBankTransaction] = useState(null)

  const handleNextStep =() => {
    setCurrentstep(step => step += 1)
    console.log("aiaiai")
  }

  const handlePrevStep =() => {
    setCurrentstep(step => step -= 1)

  }

  const fetchBankTransactionData = async () => {
    try {
      if (id) {
        const result = await axiosPrivate.get(FETCH_STATEMENT_DATA + id)
        setBankStatementData(result.data)
        setDisplayPdfFile(result.data.filelocation+ '#toolbar=0')
        setFileToSend(result.data.filelocation)
      }
    } catch (error) {
      
    }
  }

  useEffect(() => {
    fetchBankTransactionData()
  }, [id])

  const steps = [    
    <LinkBankTransaction statementid={id} bankStatementData={bankStatementData} goBack={handlePrevStep} onSelection={(tx_id) => {setSelectedBankTransaction(tx_id) ;handleNextStep()}}/>,
    <LinkTransactionsToInvoices bankStatementData={bankStatementData} goBack={handlePrevStep} onSubmit={handlePrevStep} selectedTransaction={selectedBankTransaction}/>
  ]

  return (
  <div>
    <div className='container mx-auto page pt-12 p-4 text-center'>
      <div className="grid grid-cols-3 mb-4">
        <GoBackButton className='col-span-1'/>
        <h1 className='col-span-1'>Add New Bank Transaction</h1>
      </div>
      <div className="flex justify-center items-center mt-8">
        <div className="bg-white flex w-full">
          <div className="w-1/2 px-6 py-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row">
                {DisplayPdfFile ? (
                  <embed src={DisplayPdfFile} type="application/pdf" width="100%" height="700vh" />
                ): 'file not found'}
              </div>
            </div>
          </div>
          <div className="w-1/2 px-4 py-8">
            {DisplayPdfFile ? steps[currentStep] : <p>Add a file to continue</p>}
          </div>
        </div>
      </div>
    </div>
  </div>

  );
}
