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
    bankid: ''
};

const transactionSchema = Joi.object({
    transactiondate: Joi.date().required().label('Transaction Date'),
    transactionamount: Joi.number().required().label('Transaction Amount'),
    bankid: Joi.string().required().label('Bank ID')
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
            setErrors(errors)
            return false
        }
        setErrors({})
        return true
    };

    const addNewBanktransaction = async () => {
        if (!validateTransactionData(banktransactionData)) {
            return
        }

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
                    labelName="Bank transaction date:"
                    className='w-1/2'
                    type='date'
                    inputName='transactiondate'
                    value={banktransactionData.transactiondate}
                    handleChange={handleChange}
                    error={bankTransactionErrors.transactiondate}
                />
                <FormItem
                    labelName="Bank transaction ID:"
                    type='text'
                    className='w-1/2'
                    inputName='bankid'
                    value={banktransactionData.bankid}
                    handleChange={handleChange}
                    error={bankTransactionErrors.bankid}
                />
                <FormItem
                    labelName="Bank transaction amount:"
                    type='number'
                    className='w-1/2'
                    inputName='transactionamount'
                    value={banktransactionData.transactionamount}
                    handleChange={handleChange}
                    error={bankTransactionErrors.transactionamount}
                />
            </div>

            <div className='buttons-holder'>
                <button onClick={handleClosePopup} className='buton-secondary'>Cancel</button>
                <button onClick={addNewBanktransaction} className='buton-main'>Confirm</button>
            </div>
        </PopupBase>
    );
}