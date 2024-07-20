import React, { useEffect, useRef, useState } from 'react'
import ConfirmationPopup from '../../../components/Popups/ConfirmationPopup'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import useAlert from '../../../hooks/useAlert'

const CREATE_TRANSACTION_URL = '/api/banktransactions'
const EDIT_TRANSACTION_URL = '/api/banktransactions'

const DEFAULT_TRANSACTION_DATA = {
    transactiondate: '',
    transactionamount: '',
    bankid: ''
}

export default function CreateBankTransactionPopup({showPopup, closePopup, editBanktransactionData, bankStatementData}) {
    const [banktransactionData, setBanktransactionData] = useState(editBanktransactionData || DEFAULT_TRANSACTION_DATA)
    const inputRef = useRef(null)

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleClosePopup = (shouldRefresh) => {
        setBanktransactionData(DEFAULT_TRANSACTION_DATA)
        closePopup(shouldRefresh)
    }

    const addNewBanktransaction = async () => {
        try {
            const transactionData = {
                ...banktransactionData,
                statementid: bankStatementData.statementid,
                transactioncode: bankStatementData.vendorname + banktransactionData.transactiondate
            }

            if (!transactionData.transactionid) {
                await axiosPrivate.post(CREATE_TRANSACTION_URL, JSON.stringify(transactionData))
                setMessage('Banktransaction created Successfully', false)
            } else {
                await axiosPrivate.patch(EDIT_TRANSACTION_URL, JSON.stringify(transactionData))
                setMessage('Banktransaction edited Successfully', false)
            }
            handleClosePopup(true)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    useEffect(() => {
        if (editBanktransactionData) {
            setBanktransactionData(editBanktransactionData)
        }
    }, [editBanktransactionData])

    useEffect(() => {
        if (showPopup && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [showPopup])

    const handleChange = (e) => {
        const { name, value } = e.target
  
        setBanktransactionData({
          ...banktransactionData,
          [name]: value,
        })
      }

  return (
    <ConfirmationPopup
    showPopup={showPopup}
    closePopup={handleClosePopup}
    confirm={addNewBanktransaction}>
        <h2>{banktransactionData.banktransactionid ? "Edit bank transaction" : "Add New Bank Transaction"}</h2>
        <br/>
        <div>
            <div className='flex flex-col items-center'>
                <label>Bank transaction date: </label>
                <input ref={inputRef} className='w-1/2' type='date' name='transactiondate' value={banktransactionData.transactiondate} onChange={handleChange}></input>
            </div>
            <div className='flex flex-col items-center'>
                <label>Bank transaction ID: </label>
                <input type='text' className='w-1/2' name='bankid' value={banktransactionData.bankid} onChange={handleChange}></input>
            </div>
            <div className='flex flex-col items-center'>
                <label>Bank transaction amount: </label>
                <input type='number' className='w-1/2' name='transactionamount' value={banktransactionData.transactionamount} onChange={handleChange}></input>
            </div>
        </div>
    </ConfirmationPopup>
  )
}
