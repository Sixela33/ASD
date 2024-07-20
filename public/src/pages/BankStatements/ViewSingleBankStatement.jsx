import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useParams, useNavigate } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton';
import { FiEdit, FiDownload, FiTrash } from 'react-icons/fi';
import { permissionsRequired } from '../../utls/permissions';
import { toCurrency } from '../../utls/toCurrency';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';

const GET_STATEMENT_DATA_URL = '/api/bankStatements/byID/'
const GET_LINKED_TRANSACTIONS_URL = '/api/bankTransactions/statement/'
const DELETE_STATEMENT_URL = '/api/bankStatements'

export default function ViewSingleBankStatement() {
    const axiosPrivate = useAxiosPrivate()
    const { id } = useParams();
    const navigateTo = useNavigate()
    const { setMessage } = useAlert()

    const [statementData, setStatementData] = useState(null)
    const [linkedTransactions, setLinkedTransactions] = useState([])
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const fetchStatementData = async () => {
        try {
            const response = await axiosPrivate.get(GET_STATEMENT_DATA_URL + id)
            setStatementData(response?.data)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    };

    const fetchLinkedTransactions = async () => {
        try {
            const response = await axiosPrivate.get(GET_LINKED_TRANSACTIONS_URL + id)
            setLinkedTransactions(response?.data)
        } catch (error) {
            setMessage(error.response?.data, true);
        }
    }

    useEffect(() => {
        if (id) {
            fetchStatementData()
            fetchLinkedTransactions()
        }
    }, [id])

    const downloadFile = () => {
        if(statementData?.filelocation){
            window.open(`${statementData.filelocation}`, '_blank', 'noreferrer')
        } else {
            setMessage("Image not found")
        }
    }

    const handleDeleteStatement = async () => {
        try {
            // await axiosPrivate.delete(DELETE_STATEMENT_URL + '/' + id)
            //navigateTo('/bankStatements')
            setMessage("work in progress")
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true)
            setShowDeleteConfirmation(false)
        }
    }

    const buttonOptions = [
        {
            text: 'Link With Transactions', 
            action: () => navigateTo('/bankStatement/link/' + id),
            icon: '+',
            minPermissionLevel: permissionsRequired['download_statement'],
        }, 
        {
            text: 'Download Statement', 
            action: downloadFile,
            icon: <FiDownload />,
            minPermissionLevel: permissionsRequired['download_statement'],
        }, 
        {
            text: 'Edit Statement', 
            action: () => navigateTo('/bankStatement/add/' + id),
            icon: <FiEdit />,
            minPermissionLevel: permissionsRequired['edit_statement']
        },
        {
            text: 'Delete Statement', 
            action: () => setShowDeleteConfirmation(true),
            icon: <FiTrash />,
            minPermissionLevel: permissionsRequired['delete_statement']
        }
    ]

    return (
        <div className='container mx-auto pt-8 p-4 text-center page'>
            <FloatingMenuButton options={buttonOptions}/>
            <ConfirmationPopup 
                showPopup={showDeleteConfirmation} 
                closePopup={() => setShowDeleteConfirmation(false)} 
                confirm={handleDeleteStatement}> 
                Are you sure you want to delete this statement from the database?
            </ConfirmationPopup>
            <div className='grid grid-cols-3 mb-4'>
                <button className='go-back-button col-span-1' onClick={() => navigateTo('/bankStatements')} >Go Back</button>
                <h1 className='col-span-1'>Statement Overview</h1>
            </div>
            {statementData && (
                <div className='flex flex-col md:flex-row items-start md:items-center'>
                    <div className='md:w-1/2 mb-8 md:mb-0'> 
                        {statementData?.filelocation ? (
                            <embed src={`${statementData.filelocation}#toolbar=0`} type="application/pdf" width="100%" height="600vh" />
                        ) : 'file not found'}
                    </div>
                    <div className='md:w-1/2 md:pl-10'>
                        <div className="grid grid-cols-2 gap-8 my-4 mx-auto text-left font-bold">
                            <div>
                                <p>Vendor Name: {statementData.vendorname}</p>
                            </div>
                                <p>Statement Date: {statementData.statementdate}</p>
                        </div>
                        <div className='table-container h-[60vh] mt-3'>
                            <TableHeaderSort
                                headers={{
                                    "Transaction ID": "transactionid", 
                                    "Transaction Amount": "transactionamount",
                                    "Total Linked": "totalinvoiceamount",
                                    "Transaction Date": "transactiondate"
                                }}
                            >
                                {linkedTransactions.map((tx, index) => {
                                    return (
                                        <tr key={index} onClick={() => navigateTo('/bankStatement/link/' + id)}>
                                            <td>{tx.transactionid}</td>
                                            <td>{toCurrency(tx.transactionamount)}</td>
                                            <td>{toCurrency(tx.totalinvoiceamount)}</td>
                                            <td>{tx.transactiondate}</td>
                                        </tr>
                                    );
                                })}
                            </TableHeaderSort>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
