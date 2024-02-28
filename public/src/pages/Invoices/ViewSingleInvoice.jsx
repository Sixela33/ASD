import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useParams, useNavigate } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import LocalDataSortTable from '../../components/Tables/LocalDataSortTable';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';

const GET_PROVIDED_PROJECTS_URL = '/api/invoices/providedProjects/'

export default function ViewSingleInvoice() {
    const axiosPrivate = useAxiosPrivate()
    const { id } = useParams();
    const navigateTo = useNavigate()
    const {setMessage} = useAlert()

    const [projectsProvided, setProjectsProvided] = useState([])
    const [invoiceData, setInvoiceData] = useState([])
    const [invoiceFlowers, setInvoiceFlowers] = useState([])

    const fetchProjectsProvided = async () => {
        try {
            const response = await axiosPrivate.get(GET_PROVIDED_PROJECTS_URL + id);
            console.log(response.data)
            const {flowers, invoiceData, projects, bankTransactions} = response?.data
            
            console.log(bankTransactions)
            if (!flowers || !invoiceData || !projects){
                setMessage("Server Error")
                useNavigate('/invoice')
            }
            
            const processedFlowerData = []
            flowers.map((flower) => {
                let ix = processedFlowerData.findIndex((item) => item.flowerid == flower.flowerid)
                if (ix == -1) {
                    processedFlowerData.push(flower)
                } else {
                    processedFlowerData[ix].numstems = processedFlowerData[ix].numstems + flower.numstems
                }
            })

            setProjectsProvided(projects)
            setInvoiceData(invoiceData[0])
            console.log(processedFlowerData)
            setInvoiceFlowers(processedFlowerData)
        } catch (error) {
            setMessage(error.response?.data, true);
        }
    }

    useEffect(() => {
        fetchProjectsProvided()
    }, [])

    const downloadFile = () => {
        window.open(`${BASE_URL}/api/${invoiceData.filelocation}`, '_blank', 'noreferrer')
    }

    return (
        <div className="container mx-auto">
            <div className='flex flex-col items-center justify-between'>
                <button onClick={() => navigateTo('/invoice')} className="text-blue-500 hover:text-blue-700">go back</button>
                <h1 className="text-center text-3xl my-8">Invoice Overview</h1>
            </div>
            <div className="mt-8 w-full flex flex-col md:flex-row items-start md:items-center">
                <div className='w-full md:w-2/4 mb-8 md:mb-0'> 
                    {console.log("location", `${BASE_URL}/api/${invoiceData.filelocation}`)}
                    <embed src={`${BASE_URL}/api/${invoiceData.filelocation}#toolbar=0`} type="application/pdf" width="100%" height="600vh" />
                    <button onClick={downloadFile} className="bg-black text-white font-bold py-2 px-4 rounded mt-3">Download invoice</button>
                </div>
                <div className='mx-10 w-full md:w-2/4 grid grid-col md:grid-rows-2 '> 
                    <div className="grid grid-row md:grid-cols-2 gap-8 px-20 ml-10 font-bold w-full">
                        <div className='grid-row'>
                            <p>Vendor Name: {invoiceData.vendorname}</p>
                            <p>Invoice amount: ${parseFloat(invoiceData.invoiceamount).toFixed(2)}</p>
                        </div>
                        <div className='grid-row'>
                            <p>Date loaded: {invoiceData.invoicedate}</p>
                            <p>Loaded By: {invoiceData.email}</p>
                        </div>
                    </div>
                    <div className='overflow-auto max-h-[20vh] w-full'>
                        <LocalDataSortTable
                            headers = {{
                                "Project Client": "projectclient", 
                                "Project Contact": "projectcontact", 
                                "Project Description": "projectdescription", 
                                "invoice Date": "projectdescription", 
                                "Project Date": "projectdate"}
                            }
                            data={projectsProvided}
                            />
                    </div>
                    <div className='overflow-auto max-h-[20vh] w-full mt-3'>
                        <TableHeaderSort
                            headers = {{
                                "flowername": "flowername", 
                                "unitprice": "unitprice",
                                "numstems": "numstems", 
                            }}
                        >
                            {invoiceFlowers.map((item, index) => {
                                return <tr key={index} className='bg-gray-300 border' onClick={() => onRowClick(item)}>
                                    <td>{item.flowername}</td>
                                    <td>$ {parseFloat(item.unitprice).toFixed(2)}</td>
                                    <td>{item.numstems}</td>
                                </tr>
                            })}
                        </TableHeaderSort>
                      
                    </div>

                                   
                </div>
            </div>
        </div>

    );
}
