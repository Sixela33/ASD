import React, { useEffect, useMemo, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate, useParams } from 'react-router-dom'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { toCurrency } from '../../utls/toCurrency'
import LoadingPage from '../LoadingPage'
import useAlert from '../../hooks/useAlert'
import LoadingPopup from '../../components/LoadingPopup'
import RedirectToFilePopup from '../../components/Popups/RedirectToFilePopup'

export default function ViewSingleTransaction() {
    const axiosPrivate = useAxiosPrivate()
    const {id} = useParams()
    const navigateTo = useNavigate()
    const {setMessage} = useAlert()

    const [transactionData, setStatementData] = useState(null)
    const [linkedInvoices, setLinkedInvoices] = useState([])
    const [linkedProjects, setLinkedProjects] = useState([])

    const [loading, setLoading] = useState(true);
    const [generatingCSV, setGeneratingCSV] = useState(false)
    const [showRedirectPopup, setShowRedirectPopup] = useState(false)
    const [fileRedirectUrl, setFileRedirectUrl] = useState('')

    const exportToCSV = async () => {
        try {
            setGeneratingCSV(true)
            const response = await axiosPrivate.post('/api/bankTransactions/generateExcelDoc/' + id)
            const documentId = response.data 
            console.log(response.data)
            const url = 'https://docs.google.com/spreadsheets/d/' + documentId
            
            setShowRedirectPopup(true)
            setFileRedirectUrl(url)
            window.open(url, '_blank').focus()
        } catch (error) {
            
        } finally {
            setGeneratingCSV(false)
        }
    }

    const fetchTransactionData = async () => {
        try {
            setLoading(true)
            const response = await axiosPrivate.get('/api/bankTransactions/' + id)

            setStatementData(response.data?.transaction_data?.[0])
            setLinkedProjects(response.data?.linked_projects)
            setLinkedInvoices(response.data?.linked_invoices)

        } catch (error) {
            console.log(error)
            setMessage(error.message)
            navigateTo('/bankTransactions')
        } finally {
            setLoading(false)
        }
    }

    const totalLinkedToProjects = useMemo(() => {
        return linkedProjects.reduce((acc, project) => acc + project.tiedexpenses, 0);
    }, [linkedProjects]);

    useEffect(() => {
        fetchTransactionData()
    }, [])

    if (loading) return <LoadingPage/>

    return (
        <div className='container mx-auto pt-8 p-4 text-center page'>
            <LoadingPopup showPopup={generatingCSV}>
                <h1>Creating your document</h1>
                <p>Please wait and you will be redirected</p>
            </LoadingPopup>
            <RedirectToFilePopup
                showPopup={showRedirectPopup && fileRedirectUrl}
                closePopup={() => setShowRedirectPopup(false)}
                url={fileRedirectUrl}>
            </RedirectToFilePopup>
            <div className='grid grid-cols-3 mb-4'>
                <button className='go-back-button col-span-1' onClick={() => navigateTo('/bankTransactions')} >Go Back</button>
                <h1 className='col-span-1'>Transaction Details</h1>
            </div>
            <div>
                {transactionData && <div className='flex md:flex-row justify-evenly md:my-5'>
                    <p><strong>Transaction ID:</strong> {transactionData.transactionid}</p>
                    <p><strong>Date:</strong> {new Date(transactionData.transactiondate).toLocaleDateString()}</p>
                    <p><strong>Transaction Amount:</strong> {toCurrency(transactionData.transactionamount)}</p>
                    <p><strong>Total Tied: </strong>{toCurrency(totalLinkedToProjects || 0)}</p>
                </div>}
            </div>
            <div className='flex flex-col md:flex-row md:p-10 items-start min-h-full'>
                <div className='md:w-1/2 mb-8 px-5 md:mb-0'>
                    <h2>Invoices Selected</h2>
                    <TableHeaderSort
                        headers={{
                            "Invoice Number": "invoicenumber", 
                            "Amount": "invoiceamount",
                            "Date": "invoicedate",
                        }}
                    >
                        {linkedInvoices && linkedInvoices.map((invoice, index) => {
                            return <tr key={index}>
                                <td>{invoice.invoicenumber}</td>
                                <td>{toCurrency(invoice.invoiceamount)}</td>
                                <td>{invoice.invoicedate}</td>
                            </tr>
                        })}

                    </TableHeaderSort>
                </div>
                <div className='md:w-1/2 mb-8 px-5 md:mb-0'>
                    <div className=''>
                        <h2>Project Breakdown</h2>

                        <TableHeaderSort
                        headers={{
                            "ID": "projectid", 
                            "Description": "projectdescription",
                            "Tied Expenses": "tiedexpenses",
                        }}>
                            {linkedProjects && linkedProjects.map((project, index) => {
                                return <tr key={index}>
                                    {console.log(project)}
                                    <td>{project.projectid}</td>
                                    <td>{project.projectdescription}</td>
                                    <td>{toCurrency(project.tiedexpenses)}</td>
                                </tr>
                            })}
                        </TableHeaderSort>
                    </div>
                </div>
            </div>
            <div className='text-right'>
                <button className='buton-secondary' onClick={exportToCSV}>export to CSV</button>
                <button className='buton-main mx-10' onClick={() => navigateTo('/bankStatement/link/' + transactionData.statementid)}> Edit Transaction</button>
            </div>
        </div>
    )
}
