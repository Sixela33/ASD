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
            if(!selectedVendor) selectedVendor = ''

            const response = await axiosPrivate.get(GET_INVOICES_URL + page.current , {
                params: {
                    orderBy: sortConfig.key,
                    order: sortConfig.direction,
                    invoiceNumber: searchByInvoiceNumber,
                    invoiceID: searchByInvoiceID,
                    specificVendor: selectedVendor,
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
            <div className="grid grid-cols-1 md:grid-cols-3 mb-4">
                <button onClick={() => navigateTo('/')} className="go-back-button col-span-1">Go Back</button>
                <h1 className='col-span-1'>Invoices</h1>
                <Link to="/invoice/add/" className="buton-main col-span-1 mx-auto">Add New Invoice</Link>
            </div>
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Invoice ID</label>
                    <input
                        type="text"
                        onChange={(e) => setSearchByInvoiceID(e.target.value)}
                        className="w-full px-3"
                    />
                </div>
                <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input
                    type="text"
                    onChange={(e) => setSearchByInvoiceNumber(e.target.value)}
                    className="w-full px-3"
                />
                </div>
                <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Filter by vendor</label>
                <select value={selectedVendor} onChange={(e) => { setSelectedVendor(e.target.value)}} className="w-full px-3 py-2">
                    <option value="">Clear selection</option>
                    {allVendors.map((vendor, index) => (
                    <option key={index} value={vendor.vendorid}>
                        {vendor.vendorname}
                    </option>
                    ))}
                </select>
                </div>
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <button className='text-purple-700 text-opacity-0' onClick={() => {setStartDate(''); setEndDate('')}}>Clear</button>
                    <label className="text-sm font-medium text-gray-700">Date Range</label>
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="go-back-button" >Clear</button>
                </div>
                <div className="flex space-x-2">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-1/2 px-3 py-2" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-1/2 px-3 py-2" />
                </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Amount Range</label>
                    <div className="flex space-x-2">
                        <input type="number" placeholder="Min" value={minAmount} onChange={(e) => setMinAmmount(e.target.value)} className="w-1/2 px-3 py-2" />
                        <input type="number" placeholder="Max" value={maxAmount} onChange={(e) => setMaxAmmount(e.target.value)} className="w-1/2 px-3 py-2" />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                <label htmlFor="showOnlyIncomplete" className="text-sm font-medium text-gray-700">
                    Only Incomplete
                </label>
                <input type="checkbox" checked={showOnlyWithMissingLink} onChange={() => setShowOnlyWithMissingLink(!showOnlyWithMissingLink)} className="h-4 w-4" />
                </div>
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
