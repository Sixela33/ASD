import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import useAlert from '../../../hooks/useAlert'
import TableHeaderSort from '../../../components/Tables/TableHeaderSort'
import { sortData } from '../../../utls/sortData'
import { debounce } from 'lodash'
import CreateBankTransactionPopup from '../Popups/CreateBankTransactionPopup'
import { useNavigate } from 'react-router-dom'
import { toCurrency } from '../../../utls/toCurrency'

const FETCH_TRACTIONS_URL = '/api/bankTransactions/statement/'

const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {
    'ID': 'bankTransactionid', 
    'Code': 'bankTransactioncode', 
    'Amount': 'amount',
    'Assigned Amount': '',
    '' : ''
}

export default function LinkBankTransaction({bankStatementData, onSelection}) {
    const axiosPrivate = useAxiosPrivate()
    const navigateTo = useNavigate()
    const { setMessage } = useAlert()

    const [showNewBankTransactionPopup, setShowNewBankTransactionPopup] = useState(false)
    const [bankTransactionsData, setBankTransactionsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);

    const [editBankTransactionData, setEditbankTransactiondata] = useState(null)

    const fetchBankTransactions = async () => {
        try {
            if (bankStatementData.statementid){
                const response = await axiosPrivate.get(FETCH_TRACTIONS_URL + bankStatementData.statementid)
                setBankTransactionsData(response.data)
            } else {
                setMessage("Error", true)
            }
        } catch (error) {
            setMessage(error.response?.data.message)            
        }
    }

    useEffect(() => {
        fetchBankTransactions()
    }, [])

    const handleCloseBankTransactionPopup = (shouldRefresh) => {
        setShowNewBankTransactionPopup(false)
        setEditbankTransactiondata(null)
        if(shouldRefresh === true){
            fetchBankTransactions()
        }
    }
    
    return (
        bankTransactionsData && <div className='container mx-auto mt-8 p-4 text-center'>
            <CreateBankTransactionPopup
                showPopup={showNewBankTransactionPopup} 
                closePopup={handleCloseBankTransactionPopup} 
                editBankTransactionData={editBankTransactionData}
                bankStatementData={bankStatementData}
            />
                <div className='my-2'>
                    <h1>Bank Transactions</h1>
                </div>
                <div>
                    <button className='buton-main' onClick={() => setShowNewBankTransactionPopup(true)}>Add new bankTransaction</button>
                </div>
                <div className='table-container h-[40vh]'>
                    <TableHeaderSort
                        headers={headers}
                        setSortConfig={setSortConfig}
                        defaultSortConfig={defaultSortConfig}
                        sortConfig={sortConfig}>
                        {sortData(bankTransactionsData, sortConfig).map((bankTransaction, index) => {
                            return <tr key={index} onClick={() => onSelection(bankTransaction)}>
                                <td>{bankTransaction.bankid}</td>
                                <td>{bankTransaction.transactioncode}</td>
                                <td>{toCurrency(bankTransaction.transactionamount)}</td>
                                <td>{toCurrency(bankTransaction.totalinvoiceamount)}</td>
                                <td>
                                    <button className='go-back-button'>Edit</button>
                                    <button className='go-back-button'>Remove</button>
                                </td>
                            </tr>
                        })}
                    </TableHeaderSort>
                </div>
                <button className='buton-main' onClick={() => navigateTo('/')}>Save</button>
            </div>
    )
}
