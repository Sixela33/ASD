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

const searchByOptions = [
    {displayName: "Invoice ID", value: "invoiceid"}, 
    {displayName: "Invoice Number", value: "invoicenumber"}
] 

const defaultSortConfig = { key: 'invoiceid', direction: 'asc' }

export default function ViewInvoices() {
    let [sortConfig, setSortConfig] = useState(defaultSortConfig)
    const [invoiceData, setInvoiceData] = useState(null)
    const [bankTransactionData, setBankTransactionData] = useState('')
    const [selectedInvoices, setSelectedInvoices] = useState([])
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
    const [searchByInputvalue, setSearchByInputValue] = useState('')
    const [selectedSearchFilter, setSelectedSearchFilter] = useState(searchByOptions[0].value)
    const [showOnlyWithMissingLink, setShowOnlyWithMissingLink] = useState(false)

    const [allVendors, setAllVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState('')

    const page = useRef(0)
    const dataLeft = useRef(false)

    const {setMessage} = useAlert()
    const axiosPrivate = useAxiosPrivate()
    const navigateTo = useNavigate()


    const fetchData = async (sortConfig, searchValue, searchCol, selectedVendor, showOnlyWithMissingLink) => {
        try {
            if (!dataLeft.current) {
                return;
            }

            const tempSelectedVendor = selectedVendor == undefined ? '': selectedVendor

            const response = await axiosPrivate.get(GET_INVOICES_URL + page.current + 
                '?orderBy='+ sortConfig.key + 
                '&order=' + sortConfig.direction + 
                '&searchQuery=' + searchValue +
                '&searchBy=' + searchCol + 
                '&specificVendor=' + tempSelectedVendor+ 
                '&onlyMissing=' + showOnlyWithMissingLink || false );

            if (response.data?.length === 0) {
                dataLeft.current = false;
                return;
            }
            page.current = page.current + 1;
            setInvoiceData((prevInvoices) => [...prevInvoices, ...response?.data]);
        } catch (error) {
            setMessage(error.response?.data);
        }
    };

    const debounced = useCallback(debounce(fetchData, 200), []);

    useEffect(() => {
        fetchData(sortConfig, searchByInputvalue, selectedSearchFilter, selectedVendor, showOnlyWithMissingLink);
    }, []);

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
        fetchVendors()
    }, [])

    useEffect(() => {
        setInvoiceData([])
        page.current = 0
        dataLeft.current=true

        debounced(sortConfig, searchByInputvalue, selectedSearchFilter, selectedVendor, showOnlyWithMissingLink)
        
    }, [sortConfig, searchByInputvalue, selectedSearchFilter, selectedVendor, showOnlyWithMissingLink])

    const handleInvoiceSelection = (invoiceData) => {
        navigateTo(`/invoice/view/${invoiceData.invoiceid}`)
    }

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
            setMessage('Bank transacion added succesfully.', false)
            setBankTransactionData('')
            setSelectedInvoices({})
            page.current = page.current - 1;
            fetchData(sortConfig, searchByInputvalue, selectedSearchFilter)
       
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data)
        }
    }

    const tryToAddBankTX = () => {
        if (Object.keys(selectedInvoices).length == 0 ) {
            setMessage('Please select the projects you want to link with this bank transaction')
            return
        }
        
        if (!bankTransactionData || bankTransactionData == '') {
            setMessage('Please fill the bank transaction information to procede')
            return
        } 

        setShowConfirmationPopup(true)

    }


    return (
        invoiceData ? <div className='container mx-auto pt-12 p-4 text-center page'>
            <ConfirmationPopup showPopup={showConfirmationPopup} closePopup={() => setShowConfirmationPopup(false)} confirm={addBankTransactions}>
                <p>You are about to link invoices: {JSON.stringify(Object.keys(selectedInvoices))} with the bank transaction "{bankTransactionData}".</p>
                <br/>
                <p>Do you want to procede?</p>
            </ConfirmationPopup>
            <div className="grid grid-cols-3 mb-4">
                <button onClick={() => navigateTo('/')} className="go-back-button col-span-1">Go Back</button>
                <h1 className='col-span-1'>Invoices</h1>
                <Link to="/invoice/add/" className="buton-main col-span-1 mx-auto">Load Invoice</Link>
            </div>
            <div className='m-2 text-left flex items-center space-x-4 justify-evenly'>
                    <div className='flex items-center space-x-1'>
                        <input type="text" placeholder='search by...' value={searchByInputvalue} onChange={(e) => setSearchByInputValue(e.target.value)} />
                        <select className='p-2' onChange={e => setSelectedSearchFilter(e.target.value)}>
                            {searchByOptions.map((item, index) => {
                                return <option value={item.value} key={index}>{item.displayName}</option>
                            })}
                        </select>
                    </div>
                    <div className='flex items-center space-x-1'>
                        <span className='ml-4'>Filter by vendor: </span>
                        <select className='p-2' onChange={e => setSelectedVendor(e.target.value)}>
                            <option value={''}>Select Vendor</option>
                            {allVendors.map((item, index) => {
                                return <option value={item.vendorid} key={index}>{item.vendorname}</option>
                            })}
                        </select>
                    </div>
                    <div className='flex items-center space-x-1'>
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
                >

                    {invoiceData.map((invoice, index) => {
                    return <tr key={index}  onClick={() => handleInvoiceSelection(invoice)}>
                        <td>{invoice?.invoiceid}</td>
                        <td>{invoice?.vendorname}</td>
                        <td>${toCurrency(invoice?.invoiceamount)}</td>
                        <td>{invoice?.invoicedate}</td>
                        <td>{invoice?.invoicenumber}</td>
                        <td 
                            className={`${invoice.hastransaction ? 'bg-green-500' : 'bg-red-500'}`}
                            onClick={e => {e.stopPropagation()}}>
                            {invoice.hastransaction ? "Yes": 'No'}
                            <input className='ml-4' type='checkbox' checked={isInvoiceSelected(invoice.invoiceid)} onChange={(e) => {handleCheckboxClick(e, invoice.invoiceid)}} />
                        </td>
                     </tr>
                    })}

                </TableHeaderSort>                    
            </div>
            <div className='my-2'>
                <input  type='text' value={bankTransactionData} onChange={e => setBankTransactionData(e.target.value)}></input>
                <button onClick={tryToAddBankTX} className='buton-main ml-3'>Link bank transaction</button>
            </div>
        </div>: <LoadingPopup/>
    );
}
