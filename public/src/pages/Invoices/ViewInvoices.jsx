import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';

const GET_INVOICES_URL = '/api/invoices/invoices/1/';

export default function ViewInvoices() {
    const [invoiceData, setInvoiceData] = useState([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false)

    const {setMessage} = useAlert()
    const axiosPrivate = useAxiosPrivate();

    const navigateTo = useNavigate();

    const fetchData = async () => {
        try {
            const response = await axiosPrivate.get(GET_INVOICES_URL);
            setInvoiceData(response?.data);
        } catch (error) {
            setMessage(error.response?.data);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvoiceSelection = (invoiceData) => {
        if(!showCheckboxes){
            navigateTo(`/invoice/${invoiceData.invoiceid}`, {state: invoiceData})
        }
    }

    return (
        <div className='container mx-auto mt-8 p-4 bg-white shadow-md rounded-md text-center'>
            <div className="flex justify-between items-center mb-4 ">
                <h1 className="text-2xl font-bold flex-grow text-center">Invoices</h1>
                <Link to="/invoice/add" className="bg-black text-white font-bold py-2 px-4 rounded">Create new Invoice</Link>
            </div>
            <div style={{ height: '60vh' }}>
                <table className="w-full table-fixed border-collapse h-100vh" >
                    <thead>
                        <tr>                
                            {["invoiceID", "vendor", "invoiceAmount", "invoiceDate", "invoiceNumber"].map((name, index) => (
                                <td key={index} className='border p-2'>
                                    {name}
                                </td>
                            ))}
                            {showCheckboxes && <td className='border p-2'>Selected Invoices</td>}
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.map((invoice, index) => (
                            <tr key={index} className='bg-gray-300' onClick={() => handleInvoiceSelection(invoice)}>
                                <td className="border-b p-2 text-center">{invoice.invoiceid}</td>
                                <td className="border-b p-2 text-center">{invoice.vendorname}</td>
                                <td className="border-b p-2 text-center">{invoice.invoiceamount}</td>
                                <td className="border-b p-2 text-center">{invoice.invoicedate}</td>
                                <td className="border-b p-2 text-center">{invoice.invoicenumber}</td>
                                {showCheckboxes&&<td className="border-b p-2 text-center"> <input type='checkbox'></input></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={() => setShowCheckboxes(!showCheckboxes)} className="bg-gray-400 text-white font-bold py-2 px-4 rounded ">Link bank transaction</button>
        </div>
    );
}
