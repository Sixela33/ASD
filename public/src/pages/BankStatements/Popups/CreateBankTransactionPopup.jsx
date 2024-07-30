import React, { useEffect, useState } from 'react';
import Joi from 'joi';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import useAlert from '../../../hooks/useAlert';
import FormItem from '../../../components/Form/FormItem';
import PopupBase from '../../../components/PopupBase';

const CREATE_TRANSACTION_URL = '/api/banktransactions';
const EDIT_TRANSACTION_URL = '/api/banktransactions';

const DEFAULT_TRANSACTION_DATA = {
    transactiondate: '',
    transactionamount: '',
};

const transactionSchema = Joi.object({
    transactiondate: Joi.date().required().label('Transaction Date'),
    transactionamount: Joi.number().required().label('Transaction Amount'),
    transactioncode: Joi.string().required().label('Transaction Code')
}).unknown(true);

export default function CreateBankTransactionPopup({ showPopup, closePopup, editBanktransactionData, bankStatementData }) {
    const [banktransactionData, setBanktransactionData] = useState(editBanktransactionData || DEFAULT_TRANSACTION_DATA);
    const [bankTransactionErrors, setErrors] = useState({})
    const axiosPrivate = useAxiosPrivate();
    const { setMessage } = useAlert();

    const handleClosePopup = (shouldRefresh) => {
        setBanktransactionData(DEFAULT_TRANSACTION_DATA)
        setErrors({})
        closePopup(shouldRefresh)
    };

    const validateTransactionData = (data) => {
        const { error } = transactionSchema.validate(data, { abortEarly: false })
        if (error) {
            const errors = error.details.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc
            }, {})
            console.log(errors)
            setErrors(errors)
            return false
        }
        setErrors({})
        return true
    };

    const addNewBanktransaction = async () => {
        
        let transactionData = {
            ...banktransactionData,
            statementid: bankStatementData.statementid,
            transactioncode: bankStatementData.vendorname + banktransactionData.transactiondate,
        }

        if (!validateTransactionData(transactionData)) {
            return
        }

        try {

            console.log(transactionData)

            if (!transactionData.transactionid) {
                await axiosPrivate.post(CREATE_TRANSACTION_URL, JSON.stringify(transactionData))
                setMessage('Banktransaction created Successfully', false)
            } else {
                transactionData = {
                    transactionamount: transactionData.transactionamount,
                    transactiondate: banktransactionData.transactiondate,
                    transactionid: banktransactionData.transactionid,
                    transactioncode: bankStatementData.vendorname + banktransactionData.transactiondate,
                }
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

    const handleChange = (e) => {
        const { name, value } = e.target

        console.log({ name, value })
        setBanktransactionData({
            ...banktransactionData,
            [name]: value,
        })
    }

    return (
        <PopupBase
            showPopup={showPopup}

        >
            <h2>{banktransactionData.banktransactionid ? "Edit bank transaction" : "Add New Bank Transaction"}</h2>
            <br/>
            <div>
                <FormItem
                    labelName="Bank Transaction Date:"
                    className='w-1/2'
                    type='date'
                    inputName='transactiondate'
                    value={banktransactionData.transactiondate}
                    handleChange={handleChange}
                    error={bankTransactionErrors.transactiondate}
                />
                <FormItem
                    labelName="Bank Transaction Amount:"
                    type='number'
                    className='w-1/2 no-spinner'
                    inputName='transactionamount'
                    value={banktransactionData.transactionamount}
                    handleChange={handleChange}
                    error={bankTransactionErrors.transactionamount}
                    isCurrency={true}
                />
            </div>

            <div className='butons-holder'>
                <button onClick={handleClosePopup} className='buton-secondary'>Cancel</button>
                <button onClick={addNewBanktransaction} className='buton-main'>Confirm</button>
            </div>
        </PopupBase>
    );
}
