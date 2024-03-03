import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import { debounce } from 'lodash';
import ConfirmationPopup from '../../components/ConfirmationPopup';

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
        "": ""
    }

const searchByOptions = [
    {displayName: "Invoice ID", value: "invoiceid"}, 
    {displayName: "Invoice Number", value: "invoicenumber"}
] 

const defaultSortConfig = { key: null, direction: 'asc' }

export default function ViewInvoices() {
    let [sortConfig, setSortConfig] = useState(defaultSortConfig)
    const [invoiceData, setInvoiceData] = useState([])
    const [bankTransactionData, setBankTransactionData] = useState('')
    const [selectedInvoices, setSelectedInvoices] = useState([])
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
    const [searchByInputvalue, setSearchByInputValue] = useState('')
    const [selectedSearchFilter, setSelectedSearchFilter] = useState(searchByOptions[0].value)

    const [allVendors, setAllVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState('')

    const page = useRef(0)
    const dataLeft = useRef(false)

    const {setMessage} = useAlert()
    const axiosPrivate = useAxiosPrivate()
    const navigateTo = useNavigate()

    const fetchData = async (sortConfig, searchValue, searchCol, selectedVendor) => {
        try {
            if (!dataLeft.current) {
                return;
            }

            const response = await axiosPrivate.get(GET_INVOICES_URL + page.current + '?orderBy='+ sortConfig.key + '&order=' + sortConfig.direction + '&searchQuery=' + searchValue + '&searchBy=' + searchCol + '&specificVendor=' + selectedVendor);
            
            if (response.data?.length === 0) {
                dataLeft.current = false;
                return;
            }
            page.current = page.current + 1;
            setInvoiceData(response?.data);
        } catch (error) {
            setMessage(error.response?.data);
        }
    };

    const debounced = useCallback(debounce(fetchData, 200), []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await axiosPrivate.get(GET_VENDORS_URL);
            setAllVendors(response?.data);
        } catch (error) {
            setMessage(error.response?.data?.message, true);
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
        debounced(sortConfig, searchByInputvalue, selectedSearchFilter, selectedVendor)
        
    }, [sortConfig, searchByInputvalue, selectedSearchFilter, selectedVendor])

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
        <div className='container mx-auto mt-8 p-4 bg-white shadow-md rounded-md text-center'>
            <ConfirmationPopup showPopup={showConfirmationPopup} closePopup={() => setShowConfirmationPopup(false)} confirm={addBankTransactions}>
                <p>You are about to link invoices: {JSON.stringify(Object.keys(selectedInvoices))} with the bank transaction "{bankTransactionData}".</p>
                <br/>
                <p>Do you want to procede?</p>
            </ConfirmationPopup>
            <div className="flex justify-between items-center mb-4 ">
                <button onClick={() => navigateTo('/')} className="text-blue-500 hover:text-blue-700">go back</button>
                <h1 className="text-2xl font-bold flex-grow text-center">Invoices</h1>
                <Link to="/invoice/add/" className="bg-black text-white font-bold py-2 px-4 rounded">Load Invoice</Link>
            </div>
            <div className='m-2 text-left'>
    
                    <input className='border border-gray rounded mr-2'type="text" placeholder='search by...' value={searchByInputvalue} onChange={(e) => setSearchByInputValue(e.target.value)} />
                    <select className='p-2' onChange={e => setSelectedSearchFilter(e.target.value)}>
                        {searchByOptions.map((item, index) => {
                            return <option value={item.value} key={index}>{item.displayName}</option>
                        })}
                    </select>
  
                    <span className='ml-4'>Filter by vendor: </span>
                    <select className='p-2' onChange={e => setSelectedVendor(e.target.value)}>
                        <option value={''}>Select Vendor</option>
                        {allVendors.map((item, index) => {
                            console.log(item)
                            return <option value={item.vendorid} key={index}>{item.vendorname}</option>
                        })}
                    </select>
                
            </div>
            <div className='m-2 text-left'>
                
            </div>
            <div className='overflow-auto h-[60vh] w-full'>
                <TableHeaderSort
                    headers={colData} 
                    setSortConfig={setSortConfig} 
                    defaultSortConfig={defaultSortConfig} 
                    sortConfig={sortConfig} 
                >

                    {invoiceData.map((invoice, index) => {
                    return <tr key={index} className='bg-gray-300 ' onClick={() => handleInvoiceSelection(invoice)}>
                        <td className={'border p-2'}>{invoice?.invoiceid}</td>
                        <td className={'border p-2'}>{invoice?.vendorname}</td>
                        <td className={'border p-2'}>${parseFloat(invoice?.invoiceamount).toFixed(2)}</td>
                        <td className={'border p-2'}>{invoice?.invoicedate}</td>
                        <td className={'border p-2'}>{invoice?.invoicenumber}</td>
                        {invoice?.hastransaction ? 
                            <td className={'border p-2 bg-green-500'}>true</td> : 
                            <td className={'border p-2 bg-red-500'}>false</td>
                        }
                        <td className={'border p-2'} onClick={e => {e.stopPropagation()}}>
                            <input type='checkbox' checked={isInvoiceSelected(invoice.invoiceid)} onChange={(e) => {handleCheckboxClick(e, invoice.invoiceid)}} />
                        </td>
                     </tr>
                    })}

                </TableHeaderSort>                    
            </div>
            <div className='my-2'>
                <input className='border border-black' type='text' value={bankTransactionData} onChange={e => setBankTransactionData(e.target.value)}></input>
                <button onClick={tryToAddBankTX} className="bg-black text-white font-bold py-2 px-4 rounded ml-3">Link bank transaction</button>
            </div>
        </div>
    );
}
