import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import GoBackButton from '../../components/GoBackButton';
import { useParams, useNavigate } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';

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
            const {flowers, invoiceData, projects} = response?.data

            if (!flowers || !invoiceData || !projects){
                setMessage("Server Error")
                useNavigate('/invoice')
            }
            
            console.log("fowers", flowers)
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
                    <embed src={`${BASE_URL}/api/${invoiceData.filelocation}#toolbar=0`} type="application/pdf" width="100%" height="600vh" />
                    <button onClick={downloadFile} className="bg-black text-white font-bold py-2 px-4 rounded mt-3">Download invoice</button>
                </div>
                <div className='mx-10 w-full md:w-2/4 grid grid-col md:grid-rows-2 '> 
                    <div className="grid grid-row md:grid-cols-2 gap-8 px-20 ml-10 font-bold w-full">
                        <div className='grid-row'>
                            <p>Vendor Name: {invoiceData.vendorname}</p>
                            <p>Invoice amount: {invoiceData.invoiceamount}</p>
                        </div>
                        <div className='grid-row'>
                            <p>Date loaded: {invoiceData.invoicedate}</p>
                            <p>Loaded By: {invoiceData.email}</p>
                            
                        </div>
                    </div>
                    <table className="table-fixed border-collapse mx-auto overflow-y-scroll items-center w-full">
                        <thead>
                            <tr>
                                {["Project Client", "Project Contact", "Project Description", "Project Date"].map((name, index) => (
                                    <th key={index} className='border p-2'>
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {projectsProvided.map((project, index) => (
                                <tr key={index} className='bg-gray-300' onClick={() => handleInvoiceSelection(project)}>
                                    <td className="border-b p-2 text-center">{project.projectclient}</td>
                                    <td className="border-b p-2 text-center">{project.projectcontact}</td>
                                    <td className="border-b p-2 text-center">{project.projectdescription}</td>
                                    <td className="border-b p-2 text-center">{project.projectdate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <table className="table-fixed border-collapse mx-auto overflow-y-scroll items-center w-full">
                        <thead>
                            <tr>
                                {["flowername","numstems", "unitprice"].map((name, index) => (
                                    <th key={index} className='border p-2'>
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceFlowers.map((project, index) => (
                                <tr key={index} className='bg-gray-300'>
                                    <td className="border-b p-2 text-center">{project.flowername}</td>
                                    <td className="border-b p-2 text-center">{project.numstems}</td>
                                    <td className="border-b p-2 text-center">{project.unitprice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                </div>
            </div>
        </div>

    );
}
