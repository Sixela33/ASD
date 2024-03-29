import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useParams, useNavigate } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import LocalDataSortTable from '../../components/Tables/LocalDataSortTable';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton';
import { FiEdit, FiDownload } from 'react-icons/fi';
import { permissionsRequired } from '../../utls/permissions';

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
            const {flowers, invoiceData, projects, bankTransactions} = response?.data
            
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
            setInvoiceFlowers(processedFlowerData)
        } catch (error) {
            setMessage(error.response?.data, true);
        }
    }

    useEffect(() => {
        if (id) {
            fetchProjectsProvided()
        }
    }, [])

    const downloadFile = () => {
        window.open(`${BASE_URL}/api/${invoiceData.filelocation}`, '_blank', 'noreferrer')
    }

    const buttonOptions = [
        {
            text: 'Download Invoice', 
            action: downloadFile,
            icon: <FiDownload/>,
            minPermissionLevel: permissionsRequired['download_invoice'],
        }, 
        {
            text: 'Edit invoice', 
            action: () => navigateTo('/invoice/add/' + id),
            icon: <FiEdit/>,
            minPermissionLevel: permissionsRequired['edit_invoice']
        }
    ]

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>
            <FloatingMenuButton options={buttonOptions}/>

            <div className='grid grid-cols-3 mb-4'>
                <button className='go-back-button col-span-1' onClick={() => navigateTo('/invoice')} >Go Back</button>
                <h1 className='col-span-1'>Invoice Overview</h1>
            </div>
            <div className="mt-8 w-full flex flex-col md:flex-row items-start md:items-center">
                <div className='w-full md:w-2/4 mb-8 md:mb-0'> 
                    <embed src={`${BASE_URL}/api/${invoiceData.filelocation}#toolbar=0`} type="application/pdf" width="100%" height="600vh" />
                </div>
                <div className='mx-10 w-full md:w-2/4 grid grid-col md:grid-rows-2 '> 
                    <div className="items-center grid grid-row md:grid-cols-2 gap-8 mx-auto text-center font-bold ">
                        <div className='grid-row'>
                            <p>Vendor Name: {invoiceData.vendorname}</p>
                            <p>Invoice amount: ${parseFloat(invoiceData.invoiceamount).toFixed(2)}</p>
                        </div>
                        <div className='grid-row'>
                            <p>Invoice Date: {invoiceData.invoicedate}</p>
                            <p>Loaded By: {invoiceData.email}</p>
                        </div>
                    </div>
                    <div className='table-container h-[20vh] '>
                        <LocalDataSortTable
                            headers = {{
                                "Project Client": "projectclient", 
                                "Project Contact": "projectcontact", 
                                "Project Description": "projectdescription", 
                                "Project Date": "projectdate"}
                            }
                            data={projectsProvided}
                            />
                    </div>
                    <div className='table-container h-[20vh] mt-3'>
                        <TableHeaderSort
                            headers = {{
                                "Flower Name": "flowername", 
                                "Unit Price": "unitprice",
                                "Stem Quantity": "numstems", 
                            }}
                        >
                            {invoiceFlowers.map((item, index) => {
                                return <tr key={index}  onClick={() => onRowClick(item)}>
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
