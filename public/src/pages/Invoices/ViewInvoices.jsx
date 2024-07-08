import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import { debounce } from 'lodash';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';
import { toCurrency } from '../../utls/toCurrency';
import LoadingPopup from '../../components/LoadingPopup';
import { useInView } from 'react-intersection-observer';

const GET_INVOICES_URL = '/api/invoices/invoices/';
const LINK_BAKK_TX_URL = '/api/invoices/linkBankTransaction';
const GET_VENDORS_URL = '/api/vendors';

const colData = {
    "Invoice ID": "invoiceid", 
    "Vendor": "vendorname", 
    "Invoice Amount": "invoiceamount", 
    "Invoice Date": "invoicedate", 
    "Invoice Number": "invoicenumber",
    "Has transaction": "hastransaction",
}

const defaultSortConfig = { key: 'invoiceid', direction: 'asc' }

export default function ViewInvoices() {
    const [sortConfig, setSortConfig] = useState(defaultSortConfig)
    const [invoiceData, setInvoiceData] = useState([])
    const [bankTransactionData, setBankTransactionData] = useState('')
    const [selectedInvoices, setSelectedInvoices] = useState([])
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
    const [showOnlyWithMissingLink, setShowOnlyWithMissingLink] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [searchByInvoiceID, setSearchByInvoiceID] = useState('')
    const [searchByInvoiceNumber, setSearchByInvoiceNumber] = useState('')
    const [minAmount, setMinAmmount] = useState('')
    const [maxAmount, setMaxAmmount] = useState('')


    const [allVendors, setAllVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState('')

    const page = useRef(0)
    const dataLeft = useRef(true)
    const initialLoading = useRef(false)

    const {setMessage} = useAlert()
    const axiosPrivate = useAxiosPrivate()
    const navigateTo = useNavigate()
    const [ref, inView] = useInView({});


    const fetchData = async (sortConfig, searchByInvoiceNumber, searchByInvoiceID, selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount) => {
        try {
            if (!dataLeft.current) {
                return;
            }

            const tempSelectedVendor = selectedVendor == undefined ? '': selectedVendor

            const response = await axiosPrivate.get(GET_INVOICES_URL + page.current , {
                params: {
                    orderBy: sortConfig.key,
                    order: sortConfig.direction,
                    invoiceNumber: searchByInvoiceNumber,
                    invoiceID: searchByInvoiceID,
                    specificVendor: tempSelectedVendor,
                    onlyMissing: showOnlyWithMissingLink || false,
                    startDate: startDate,
                    endDate: endDate,
                    minAmount: minAmount,
                    maxAmount: maxAmount
                }})

            if (response.data?.length === 0) {
                dataLeft.current = false;
                return;
            }
            page.current = page.current + 1;
            initialLoading.current = true
            setInvoiceData((prevInvoices) => [...prevInvoices, ...response?.data]);
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data);
        }
    };

    const debounced = useCallback(debounce(fetchData, 200), []);

    const fetchVendors = async () => {
        try {
            const response = await axiosPrivate.get(GET_VENDORS_URL);
            setAllVendors(response?.data);
        } catch (error) {
            setMessage(error.response?.data, true);
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        if(initialLoading.current) {

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
    
            debounced(sortConfig, searchByInvoiceNumber, searchByInvoiceID,  selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount)
        }
        
    }, [sortConfig, searchByInvoiceNumber, searchByInvoiceID,  selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount])

    useEffect(() => {
        if (inView && initialLoading.current) {

            debounced(sortConfig, searchByInvoiceNumber, searchByInvoiceID,  selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount)
        }
    }, [inView])

    const handleInvoiceSelection = (invoiceData) => {
        navigateTo(`/invoice/view/${invoiceData.invoiceid}`)
    }

    useEffect(() => {
        debounced(sortConfig, searchByInvoiceNumber, searchByInvoiceID,  selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount);
        fetchVendors()
        
    }, []);

    const handleCheckboxClick = (e, invoiceID) => {
        setSelectedInvoices(prevState => {
            if (e.target.checked) {
                return { ...prevState, [invoiceID]: true };
            } else {
                const { [invoiceID]: omit, ...rest } = prevState;
                return rest;
            }
        });
    }

    const isInvoiceSelected = (invoiceID) => {
        return selectedInvoices.hasOwnProperty(invoiceID);
    }

    const addBankTransactions = async () => {
        try {
            const selectedInvoicesTemp = Object.keys(selectedInvoices)

            await axiosPrivate.post(LINK_BAKK_TX_URL, JSON.stringify({bankTransactionData, selectedInvoices: selectedInvoicesTemp}))
            setMessage('Bank transaction added successfully.', false)
            setBankTransactionData('')
            setSelectedInvoices({})
            page.current = page.current - 1;
            fetchData(sortConfig, searchByInvoiceNumber, searchByInvoiceID,  selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount)
       
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data)
        }
    }

    const tryToAddBankTX = () => {
        if (Object.keys(selectedInvoices).length == 0 ) {
            setMessage('Please select the invoices you want to link with this bank transaction')
            return
        }
        
        if (!bankTransactionData || bankTransactionData == '') {
            setMessage('Please fill the bank transaction information to proceed')
            return
        } 

        setShowConfirmationPopup(true)

    }

    return (
        (invoiceData && invoiceData[0]) ? <div className='container mx-auto pt-12 p-4 text-center page'>
            <ConfirmationPopup showPopup={showConfirmationPopup} closePopup={() => setShowConfirmationPopup(false)} confirm={addBankTransactions}>
                <p>You are about to link invoices: {JSON.stringify(Object.keys(selectedInvoices))} with the bank transaction "{bankTransactionData}".</p>
                <br/>
                <p>Do you want to procede?</p>
            </ConfirmationPopup>
            <div className="grid grid-cols-3 mb-4">
                <button onClick={() => navigateTo('/')} className="go-back-button col-span-1">Go Back</button>
                <h1 className='col-span-1'>Invoices</h1>
                <Link to="/invoice/add/" className="buton-main col-span-1 mx-auto">Add New Invoice</Link>
            </div>
            <div className='m-2 text-left flex items-center space-x-4 justify-evenly'>
                <div className='flex flex-col w-full items-center space-x-1'>
                    <label>Invoice ID</label>
                    <input type='text' onChange={(e) =>setSearchByInvoiceID(e.target.value)}/>
                </div>
                <div className='flex flex-col w-full items-center space-x-1'>
                    <label>Invoice Number</label>
                    <input type='text' onChange={(e) =>setSearchByInvoiceNumber(e.target.value)}/>
                </div>
                <div className='flex flex-col w-full items-center space-x-1'>
                    <span className='ml-4'>Filter by vendor: </span>
                    <select className='p-2' onChange={e => setSelectedVendor(e.target.value)}>
                        <option value={''}>Select Vendor</option>
                        {allVendors.map((item, index) => {
                            return <option value={item.vendorid} key={index}>{item.vendorname}</option>
                        })}
                    </select>
                </div>
                <div className='flex flex-col items-center space-x-1'>
                    <div className='flex w-full justify-between'>
                        <button className='text-purple-700 text-opacity-0' onClick={() => {setStartDate(''); setEndDate('')}}>Clear</button>
                        <label>Date Range</label> 
                        <button className='go-back-button' onClick={() => {setStartDate(''); setEndDate('')}}>Clear</button>
                    </div>
                    <div className='flex flex-row'>
                        <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>
                <div className='flex flex-col w-full items-center space-x-1'>
                    <div className='flex w-full justify-center'>
                        <label>Ammount Range</label> 
                    </div>
                    <div className='flex flex-row'>
                        <input className='w-1/2' type='number' value={minAmount} onChange={(e) => setMinAmmount(e.target.value)} />
                        <input className='w-1/2' type='number' value={maxAmount} onChange={(e) => setMaxAmmount(e.target.value)} />
                    </div>
                </div>
                <div className='flex w-full items-center space-x-1'>
                    <label className="mr-2">Only show incomplete invoices</label>
                    <input type='checkbox' value={showOnlyWithMissingLink} onClick={() => setShowOnlyWithMissingLink(!showOnlyWithMissingLink)} className="h-6 w-6"></input>
                </div>
            </div>
            <div className='table-container h-[60vh]'>
                <TableHeaderSort
                    headers={colData} 
                    setSortConfig={setSortConfig} 
                    defaultSortConfig={defaultSortConfig} 
                    sortConfig={sortConfig} 
                    styles={{"tbodyStyles": 'hover:cursor-pointer'}}
                >
                {invoiceData.map((invoice, index) => {
                    return <tr key={index}  onClick={() => handleInvoiceSelection(invoice)}>
                        <td>{invoice?.invoiceid}</td>
                        <td>{invoice?.vendorname}</td>
                        <td>{toCurrency(invoice?.invoiceamount)}</td>
                        <td>{invoice?.invoicedate}</td>
                        <td>{invoice?.invoicenumber}</td>
                        <td 
                            className={`${invoice.hastransaction ? 'bg-green-500' : 'bg-red-500'} hover:cursor-default`}
                            onClick={e => {e.stopPropagation()}}>
                            {invoice.hastransaction ? "Yes": 'No'}
                            <input className='ml-4' type='checkbox' checked={isInvoiceSelected(invoice.invoiceid)} onChange={(e) => {handleCheckboxClick(e, invoice.invoiceid)}} />
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
            <div className='my-2'>
                <input  type='text' value={bankTransactionData} onChange={e => setBankTransactionData(e.target.value)}></input>
                <button onClick={tryToAddBankTX} className='buton-main ml-3'>Link bank transaction</button>
            </div>
        </div>: <LoadingPopup/>
    );
}
