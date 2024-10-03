import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useParams, useNavigate } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import LocalDataSortTable from '../../components/Tables/LocalDataSortTable';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton';
import { FiEdit, FiDownload, FiTrash, FiX } from 'react-icons/fi';
import { permissionsRequired } from '../../utls/permissions';
import { toCurrency } from '../../utls/toCurrency';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';

const GET_PROVIDED_PROJECTS_URL = '/api/invoices/providedProjects/'
const DELETE_INVOICE_URL = '/api/invoices'

export default function ViewSingleInvoice() {
    const axiosPrivate = useAxiosPrivate()
    const { id } = useParams();
    const navigateTo = useNavigate()
    const {setMessage} = useAlert()

    const [projectsProvided, setProjectsProvided] = useState([])
    const [invoiceData, setInvoiceData] = useState([])
    const [invoiceFlowers, setInvoiceFlowers] = useState([])
    const [filteredFlowers, setFilteredFlowers] = useState([])
    const [bankTxs, setBankTxs] = useState([])
    const [showDeleteInvoiceConfirmation, setShowDeleteInvoiceConfirmation] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)

    const fetchProjectsProvided = async () => {
        try {
            const response = await axiosPrivate.get(GET_PROVIDED_PROJECTS_URL + id);
            const {flowers, invoiceData, projects, bankTransactions} = response?.data
            
            if (!flowers || !invoiceData || !projects){
                setMessage("Server Error")
                navigateTo('/invoice')
            }

            setProjectsProvided(projects)
            setInvoiceData(invoiceData[0])
            setInvoiceFlowers(flowers)
            setBankTxs(bankTransactions)
        } catch (error) {
            setMessage(error.response?.data, true);
        }
    }

    useEffect(() => {
        if (id) {
            fetchProjectsProvided()
        }
    }, [])

    useEffect(() => {
        filterFlowers()
    }, [selectedProject, invoiceFlowers])

    const filterFlowers = () => {
        if (selectedProject) {
            const filtered = invoiceFlowers.filter(flower => flower.projectid === selectedProject)
            setFilteredFlowers(filtered)
        } else {
            let processedFlowerData = invoiceFlowers.reduce((acc, flower) => {
                const existingFlower = acc.find(item => item.flowerid === flower.flowerid && item.unitprice === flower.unitprice);
                if (existingFlower) {
                  existingFlower.numstems += flower.numstems;
                } else {
                  acc.push({ ...flower });
                }
                return acc;
              }, []).sort((a, b) => a.addedorder - b.addedorder);
            setFilteredFlowers(processedFlowerData)
        }
    }

    const handleProjectSelect = (projectId) => {
        setSelectedProject(prevSelected => prevSelected === projectId ? null : projectId)
    }

    const downloadFile = () => {
        window.open(`${invoiceData.filelocation}`, '_blank', 'noreferrer')
    }

    const handleDeleteInvoice = async () => {
        try {
            await axiosPrivate.delete(DELETE_INVOICE_URL + '/' + id)
            setMessage('Invoice deleted successfully')
            navigateTo('/invoice')
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true);
            setShowDeleteInvoiceConfirmation(false)
        }
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
        },
        {
            text: 'Delete Invoice', 
            action: () => setShowDeleteInvoiceConfirmation(true),
            icon: <FiTrash/>,
            minPermissionLevel: permissionsRequired['edit_invoice']
        }
    ]


    return (
        <div className='container mx-auto pt-8 p-4 text-center page'>
            <FloatingMenuButton options={buttonOptions}/>
            <ConfirmationPopup 
                showPopup={showDeleteInvoiceConfirmation} 
                closePopup={() => setShowDeleteInvoiceConfirmation(false)} 
                confirm={handleDeleteInvoice}> 
                Are you sure you want to Delete this invoice from the database?
            </ConfirmationPopup>
            <div className='grid grid-cols-3 mb-4'>
                <button className='go-back-button col-span-1' onClick={() => navigateTo(-1)} >Go Back</button>
                <h1 className='col-span-1'>Invoice Overview</h1>
            </div>
            <div className="items-center grid grid-row md:grid-cols-2 gap-8 my-4 mx-auto text-left font-bold ">
                        <div className='grid-row'>
                            <p>Vendor Name: {invoiceData.vendorname}</p>
                            <p>Invoice amount: {toCurrency(invoiceData.invoiceamount)}</p>
                        </div>
                        <div className='grid-row'>
                            <p>Invoice Date: {invoiceData.invoicedate}</p>
                            <p>Loaded By: {invoiceData.email}</p>
                        </div>
                    </div>
            <div className="mt-8 w-full flex flex-col md:flex-row items-start md:items-center">
                <div className='w-full md:w-2/4 mb-8 md:mb-0'> 
                {invoiceData.filelocation ? <embed src={`${invoiceData.filelocation}#toolbar=0`} type="application/pdf" width="100%" height="600vh" />:'file not found'}
                </div>
                <div className='mx-10 w-full md:w-2/4 grid grid-col'>
                    {selectedProject && (
                        <div onClick={() => setSelectedProject(null)} className="px-2 py-1 rounded-md flex items-center">
                            Project {selectedProject} selected
                            <button className="ml-2 text-blue-600 hover:text-blue-800">
                                <FiX />
                            </button>
                        </div>
                    )}
                    <div className='relative'>
                        <div className='table-container h-[20vh] '>
                            <TableHeaderSort
                                headers = {{
                                    "Project ID": "projectid",
                                    "Project Client": "projectclient", 
                                    "Project Contact": "contactname", 
                                    "Project Description": "projectdescription", 
                                    "Project Date": "projectdate"}
                                }> 
                                {projectsProvided.map((item, index) => {
                                    const isSelected = item.projectid === selectedProject;
                                    return (
                                        <tr 
                                            key={index} 
                                            onClick={() => handleProjectSelect(item.projectid)}
                                            className={`cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        >
                                            <td>{item.projectid}</td>
                                            <td>{item.projectclient}</td>
                                            <td>{item.contactname}</td>
                                            <td>{item.projectdescription}</td>
                                            <td>{item.projectdate}</td>
                                        </tr>
                                    );
                                })}
                            </TableHeaderSort>
                        </div>
                    </div>
                    <div className='table-container h-[40vh] mt-3'>
                        <TableHeaderSort
                            headers = {{
                                "Flower Name": "flowername", 
                                "Stem Price": "unitprice",
                                "Stems Purchased": "numStems",
                            }}
                        >
                            {filteredFlowers.map((item, index) => {
                                return <tr key={index}>
                                    <td>{item.flowername}</td>
                                    <td>{toCurrency(item.unitprice)}</td>
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