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

const GET_TRANSACTIONS_URL = '/api/bankTransactions';
const GET_VENDORS_URL = '/api/vendors';

const colData = {
    "Code": "transactionid", 
    "Vendor": "vendorname", 
    "Date": "transactiondate",
    "Amount": "transactionamount", 
    "Linked Amount": "totalamount"
}

const defaultSortConfig = { key: '', direction: 'asc' }

export default function BankTransactionsList() {
    const [sortConfig, setSortConfig] = useState(defaultSortConfig)
    const [transactionData, setTransactionData] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [allVendors, setAllVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState('')

    const page = useRef(0)
    const dataLeft = useRef(true)

    const {setMessage} = useAlert()
    const axiosPrivate = useAxiosPrivate()
    const navigateTo = useNavigate()
    const [ref, inView] = useInView({});


    const fetchData = async (sortConfig, selectedVendor, startDate, endDate, minAmount, maxAmount ) => {
        
        try {
            if (!dataLeft.current) {
                return;
            }
            if(!selectedVendor?.vendorid) selectedVendor = {vendorid: ''}

            const response = await axiosPrivate.get(GET_TRANSACTIONS_URL , {
                params: {
                    offset: page.current, 
                    orderBy: sortConfig.key, 
                    order: sortConfig.direction, 
                    specificVendor: selectedVendor.vendorid, 
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
            setTransactionData((prevTransactions) => [...prevTransactions, ...response?.data]);
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

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setMessage('Invalid date range: Start date cannot be later than the end date. Please select a valid range.', false);
            return;
        }
    
        setTransactionData([])
        page.current = 0
        dataLeft.current=true

        debounced(sortConfig, selectedVendor, startDate, endDate)
        
        
    }, [sortConfig, selectedVendor, startDate, endDate])

    useEffect(() => {
        if (inView) {
            debounced(sortConfig, selectedVendor, startDate, endDate)
        }
    }, [inView])

    useEffect(() => {
        debounced(sortConfig, selectedVendor, startDate, endDate);
        fetchVendors()
        
    }, []);

    return (
        <div className='container mx-auto pt-12 p-4 text-center page'>
            <div className="grid grid-cols-1 md:grid-cols-3 mb-4">
                <button onClick={() => navigateTo('/')} className="go-back-button col-span-1">Go Back</button>
                <h1 className='col-span-1'>Bank Transactions</h1>
                <Link className='buton-main col-span-1 mx-auto' to='/bankTransaction/add'>Add New Bank Transaction</Link>
            </div>
            <div className='m-2 text-left flex items-center space-x-4 justify-evenly'>
                <div className='flex flex-col items-center space-x-1'>
                    <span className='ml-4'>Filter by Vendor: </span>
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
            </div>
            <div className='table-container h-[60vh]'>
                <TableHeaderSort
                    headers={colData} 
                    setSortConfig={setSortConfig} 
                    defaultSortConfig={defaultSortConfig} 
                    sortConfig={sortConfig} 
                    styles={{"tbodyStyles": 'hover:cursor-pointer'}}
                >
                {transactionData.map((transaction, index) => {
                    return <tr key={index}  onClick={() => navigateTo('/bankTransactions/' + transaction.transactionid)}>
                        <td>{transaction.vendorcode + transaction.transactiondate}</td>
                        <td>{transaction?.vendorname}</td>
                        <td>{transaction?.transactiondate}</td>
                        <td>{toCurrency(transaction?.transactionamount)}</td>
                        <td className={transaction?.transactionamount != transaction?.totalamount ? 'bg-red-500': 'bg-green-500'}>{toCurrency(transaction?.totalamount)}</td>
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
