import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import { debounce } from 'lodash';
import { toCurrency } from '../../utls/toCurrency';
import { useInView } from 'react-intersection-observer';
import SearchableDropdown from '../../components/Dropdowns/SearchableDropdown';

const GET_INVOICES_URL = '/api/invoices/invoices/';
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

    const {setMessage} = useAlert()
    const axiosPrivate = useAxiosPrivate()
    const navigateTo = useNavigate()
    const [ref, inView] = useInView({});


    const fetchData = async (sortConfig, searchByInvoiceNumber, searchByInvoiceID, selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount) => {
        
        try {
            if (!dataLeft.current) {
                return;
            }
            if(!selectedVendor?.vendorid) selectedVendor = {vendorid: ''}

            const response = await axiosPrivate.get(GET_INVOICES_URL + page.current , {
                params: {
                    orderBy: sortConfig.key,
                    order: sortConfig.direction,
                    invoiceNumber: searchByInvoiceNumber,
                    invoiceID: searchByInvoiceID,
                    specificVendor: selectedVendor.vendorid,
                    onlyMissing: showOnlyWithMissingLink || false,
                    startDate: startDate,
                    endDate: endDate,
                    minAmount: minAmount,
                    maxAmount: maxAmount
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

    const debounced = useCallback(debounce(fetchData, 300), []);

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

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setMessage('Invalid date range: Start date cannot be later than the end date. Please select a valid range.');
            return;
        }

        if (minAmount && maxAmount && parseInt(maxAmount) < parseInt(minAmount)) {
            setMessage('Invalid amount range: Minimum amount cannot be greater than maximum amount.');
            return;
        }

        setInvoiceData([])
        page.current = 0
        dataLeft.current=true

        debounced(sortConfig, searchByInvoiceNumber, searchByInvoiceID,  selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount)
        
        
    }, [sortConfig, searchByInvoiceNumber, searchByInvoiceID,  selectedVendor, showOnlyWithMissingLink, startDate, endDate, minAmount, maxAmount])

    useEffect(() => {
        if (inView) {

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


    return (
        <div className='container mx-auto pt-12 p-4 text-center page'>
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
                    <SearchableDropdown
                        options={allVendors}
                        label='vendorname'
                        selectedVal={selectedVendor}
                        handleChange={(vendor) => setSelectedVendor(vendor)}
                        placeholderText={'Select Vendor'}
                    />
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
                        <label>Amount Range</label> 
                    </div>
                    <div className='flex flex-row'>
                        <input className='w-1/2 no-spinner' placeholder='Min' type='number' value={minAmount} onChange={(e) => setMinAmmount(e.target.value)} />
                        <input className='w-1/2 no-spinner' placeholder='Max' type='number' value={maxAmount} onChange={(e) => setMaxAmmount(e.target.value)} />
                    </div>
                </div>
                <div className='flex w-full items-center space-x-1'>
                    <label className="mr-2">Only Incomplete: </label>
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
                            className={`${invoice.transactionid ? 'bg-green-500' : 'bg-red-500'} hover:text-blue-700`}
                            onClick={e => {e.stopPropagation(); navigateTo('/bankTransactions/' + invoice.transactionid)}}>
                            {invoice.transactionid ? `${invoice.vendorcode}-${invoice.transactiondate}`: 'No'}
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
        </div>
    );
}
