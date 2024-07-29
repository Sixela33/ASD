import React, { useEffect, useRef, useState, useCallback } from 'react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import useAlert from '../../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import TableHeaderSort from '../../../components/Tables/TableHeaderSort';
import { debounce } from 'lodash';
import { toCurrency } from '../../../utls/toCurrency';
import { useInView } from 'react-intersection-observer';

const GET_INVOICES_URL = '/api/invoices/invoices/';
const LINK_INVOICES_URL = '/api/bankTransactions/invoices'
const GET_LINKED_INVOICES = '/api/bankTransactions/invoices/'

const colData = {
    "Invoice Number": "invoicenumber",
    "Invoice Date": "invoicedate", 
    "Invoice Amount": "invoiceamount", 
    "Select": " ",
}

const defaultSortConfig = { key: 'invoiceid', direction: 'asc' }

export default function LinkTransactionsToInvoices({bankStatementData, goBack, onSubmit, selectedTransaction}) {
    const [sortConfig, setSortConfig] = useState(defaultSortConfig)
    const [invoiceData, setInvoiceData] = useState([])
    const [selectedInvoices, setSelectedInvoices] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [searchByInvoiceNumber, setSearchByInvoiceNumber] = useState('')
    const [minAmount, setMinAmmount] = useState('')
    const [maxAmount, setMaxAmmount] = useState('')

    const page = useRef(0)
    const dataLeft = useRef(true)

    const {setMessage} = useAlert()
    const axiosPrivate = useAxiosPrivate()
    const navigateTo = useNavigate()
    const [ref, inView] = useInView({});

    const fetchData = async (sortConfig, searchByInvoiceNumber, startDate, endDate, minAmount, maxAmount) => {
        
        try {
            if (!dataLeft.current) {
                return;
            }
            console.log("bankStatementData", bankStatementData)

            const response = await axiosPrivate.get(GET_INVOICES_URL + page.current , {
                params: {
                    orderBy: sortConfig.key,
                    order: sortConfig.direction,
                    invoiceNumber: searchByInvoiceNumber,
                    invoiceID: '',
                    specificVendor: bankStatementData.vendorid,
                    onlyMissing: false,
                    startDate: startDate,
                    endDate: endDate,
                    minAmount: minAmount,
                    maxAmount: maxAmount,
                    withoutTransaction: true
                }})
                
            page.current = page.current + 1;
            
            if (response.data?.length === 0) {
                dataLeft.current = false;
                return;
            }
            setInvoiceData((prevInvoices) => [...prevInvoices, ...response?.data]);
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data);
        }
    };

    const fetchAlreadyLinked = async (id) => {
        try {
            const response = await axiosPrivate.get(GET_LINKED_INVOICES + id)
            response.data.map(invoice => {
                setSelectedInvoices(prevState => {
                    return { ...prevState, [invoice.invoiceid]: {amount: invoice.invoiceamount} };

                })
            })
            setInvoiceData((prevInvoices) => [...prevInvoices, ...response?.data]);


        } catch (error) {
            console.log(error)
            setMessage(error.response?.data);
        }
    }

    const debounced = useCallback(debounce(fetchData, 200), []);
    const fetch_already_linked_debounced = useCallback(debounce(fetchAlreadyLinked, 200), []);

    useEffect(() => {

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setMessage('Invalid date range: Start date cannot be later than the end date. Please select a valid range.', false);
            return;
        }
        
        if (minAmount && maxAmount && minAmount > maxAmount) {
            setMessage('Invalid amount range: Minimum amount cannot be greater than maximum amount.', false);
            return;
        }

        setInvoiceData([])
        page.current = 0
        dataLeft.current=true

        debounced(sortConfig, searchByInvoiceNumber, startDate, endDate, minAmount, maxAmount)
        
        
    }, [sortConfig, searchByInvoiceNumber, startDate, endDate, minAmount, maxAmount])

    useEffect(() => {
        if (inView) {

            debounced(sortConfig, searchByInvoiceNumber, startDate, endDate, minAmount, maxAmount)
        }
    }, [inView])

    useEffect(() => {
        debounced(sortConfig, searchByInvoiceNumber,  startDate, endDate, minAmount, maxAmount);   
        fetch_already_linked_debounced(selectedTransaction.transactionid)
    }, [selectedTransaction]);

    const handleCheckboxClick = (e, invoice) => {
        setSelectedInvoices(prevState => {
            if (!prevState?.[invoice.invoiceid]) {
                return { ...prevState, [invoice.invoiceid]: {amount: invoice.invoiceamount} };
            } else {
                const { [invoice.invoiceid]: omit, ...rest } = prevState;
                return rest;
            }
        });
    }

    const isInvoiceSelected = (invoiceID) => {
        return selectedInvoices.hasOwnProperty(invoiceID);
    }

    const handleSubmit = async () => {
        try {
            const selectedInvoicesData = Object.keys(selectedInvoices)
            await axiosPrivate.patch(LINK_INVOICES_URL, JSON.stringify({selectedInvoicesData, selectedTransactionID: selectedTransaction.transactionid}))   
            onSubmit()
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data);
        }
    }

    const handleCancel = () => {
        setSelectedInvoices([])
        goBack()
    }

    const [totalExpenses, setTotalExpenses] = useState(0)

    const countExpenses = () => {
        let sum = 0
        for (const [key, value] of Object.entries(selectedInvoices)) {
            console.log(key, value);
            sum+=value.amount
        }
        setTotalExpenses(sum)
    }

    useEffect(() => {
        countExpenses()
    }, [selectedInvoices])

    return (
        <div className='container mx-auto pt-12 p-4 text-center page'>
            <div className="text-center">
                <h1 className='col-span-1'>Link Invoices</h1>
            </div>
            <div className='m-2 text-left flex flex-col md:flex-row items-center md:space-x-4 space-y-4 md:space-y-0 justify-evenly'>
                <div className='flex flex-col w-full md:w-1/3 items-center space-y-1'>
                    <label>Invoice Number</label>
                    <input type='text' className='w-full p-2 ' onChange={(e) => setSearchByInvoiceNumber(e.target.value)} />
                </div>
                <div className='flex flex-col w-full md:w-1/3 items-center space-y-1'>
                    <div className='flex w-full justify-between'>
                        <button className='text-purple-700 text-opacity-0' onClick={() => {setStartDate(''); setEndDate('')}}>Clear</button>
                        <label>Date Range</label> 
                        <button className='go-back-button' onClick={() => {setStartDate(''); setEndDate('')}}>Clear</button>
                    </div>
                    <div className='flex flex-row w-full justify-between space-x-2'>
                        <input type='date' className='w-1/2 p-2 ' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type='date' className='w-1/2 p-2 ' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>
                <div className='flex flex-col w-full md:w-1/3 items-center space-y-1'>
                    <div className='flex w-full justify-center text-center'>
                        <label>Amount Range</label> 
                    </div>
                    <div className='flex flex-row w-full space-x-2'>
                        <input className='w-1/2 p-2 no-spinner' placeholder='Min' type='number' value={minAmount} onChange={(e) => setMinAmmount(e.target.value)} />
                        <input className='w-1/2 p-2 no-spinner' placeholder='Max' type='number' value={maxAmount} onChange={(e) => setMaxAmmount(e.target.value)} />
                    </div>
                </div>
        </div>
            <div className='table-container h-[30vh]'>
                <TableHeaderSort
                    headers={colData} 
                    setSortConfig={setSortConfig} 
                    defaultSortConfig={defaultSortConfig} 
                    sortConfig={sortConfig} 
                    styles={{"tbodyStyles": 'hover:cursor-pointer'}}
                >
                {invoiceData.map((invoice, index) => {
                    return <tr key={index} onClick={(e) => {handleCheckboxClick(e, invoice)}}>
                        <td>{invoice?.invoicenumber}</td>
                        <td>{invoice?.invoicedate}</td>
                        <td>{toCurrency(invoice?.invoiceamount)}</td>
                        <td>
                            <input className='ml-4' type='checkbox' checked={isInvoiceSelected(invoice.invoiceid)} onChange={() => {}}/>
                        </td>
                     </tr>
                    })}

                    {dataLeft.current && (
                        <tr ref={ref}>
                            <></>
                        </tr>
                    )}
                </TableHeaderSort>    
            </div>
              {} 
            <div className='flex flex-row justify-evenly'>
                <p className="mt-4">Transaction Amount: {toCurrency(selectedTransaction.transactionamount)}</p>
                <p className="mt-4">Total Selected: <span className={(selectedTransaction.transactionamount < totalExpenses) ? 'text-red-500' : ''}>{toCurrency(totalExpenses)}</span></p>
            </div>
            <div className='flex justify-evenly space-x-5 my-4'>
                <button className='buton-secondary w-2/4' onClick={onSubmit}>Cancel</button> 
                <button className='buton-main w-2/4' onClick={handleSubmit}>Save</button> 
            </div>
        </div>
    );
}
