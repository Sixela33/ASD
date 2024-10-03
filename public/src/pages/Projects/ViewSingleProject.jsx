import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { aggregateFlowerData } from '../../utls/flowerAggregation/aggregateFlowerDataArrangements';
import { useNavigate } from 'react-router-dom'
import useAlert from '../../hooks/useAlert';
import EditArrangementPopup from '../../components/ProjectView/EditArrangementPopup';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import Tooltip from '../../components/Tooltip';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton';
import EditProjectData from '../../components/ProjectView/EditProjectData';
import InvoiceAddFlowerToProjectPopup from '../../components/InvoiceCreation/InvoiceAddFlowerToProjectPopup';
import { FiCopy, FiDownload, FiEdit, FiTrash } from "react-icons/fi";
import { RiFlowerLine } from "react-icons/ri";
import useAuth from '../../hooks/useAuth';
import { permissionsRequired } from '../../utls/permissions';
import AddAditionalExpensePopup from '../../components/Popups/AddAditionalExpensePopup'
import { toCurrency } from '../../utls/toCurrency';
import RestrictedComponent from '../../components/RestrictedComponent';
import CreateFlowerOrder from '../../utls/GoogleIntegration/CreateFlowerOrder.js';
import LoadingPopup from '../../components/LoadingPopup.jsx';
import RedirectToFilePopup from '../../components/Popups/RedirectToFilePopup.jsx';

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/';
const CLOSE_PROJECT_URL = 'api/projects/close/'
const OPEN_PROJECT_URL = 'api/projects/open/'
const DELETE_ARRANGEMENT_URL = 'api/arrangements/'
const CHANGE_FLOWER_IN_PROJECT_URL = 'api/projects/editflower/'
const ADD_NEW_EXPENSE_URL = '/api/extraServices'
const EDIT_EXPENSE_URL = '/api/extraServices'
const GENERATE_PPT_SLIDE_URL = '/api/projects/createFlowerPPT'
const DELETE_PROJECT_URL = '/api/projects/remove/'
const DUPLICATE_PROJECT_URL = '/api/projects/duplicateProject'

const PROJECT_CLOSED_ERROR = "You can't edit a closed project"


const baseProjectStats = {
    totalFlowerCost: 0,
    totalExtrasCost: 0,
    totalProjectCost: 0,
    totalFlowerBudget: 0,
    totalStaffBudget: 0,
    totalProjectProfit: 0
}

export default function ViewProject() {
    const { id } = useParams();
    const navigateTo = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()
    const {auth} = useAuth()
    const userData = auth.decoded

    const [arrangementData, setArrangementData] = useState([]);
    const [flowerData, setFlowerData] = useState([]);
    const [showFlowerData, setShowFlowerData] = useState([]);
    const [projectData, setProjectData] = useState([])
    const [extraServicesData, setExtraServicesData] = useState([])

    const [flowersByArrangement, setFlowersByArrangement] = useState(null)
    const [actualHoveredArr, setActualHoveredArr] = useState(null)

    const [estimatedFlowerCost, setEstimatedFlowerCost] = useState(0)
    const [totalBudget, setTotalBudget] = useState(0)
    
    const [showArrangementEditPopup, setShowArrangementEditPopup] = useState(false)
    const [editArrangementPopupData, setEditArrangementPopupData] = useState(null)

    const [deletePopupData, setDeletePopupData] = useState({show: false, deleteID: null})

    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const [showEditProjectPopup, setShowEditProjectPopup] = useState(false)
    const [showChangeFlowersPopup, setChangeFlowersPopup] = useState(false)
    const [changeFlowerID, setChangeFlowerID] = useState(null)
    
    const [projectStats, setProjectStats] = useState(baseProjectStats)

    const [showServicePopup, setShowServicePopup] = useState(false)
    const [editService, setEditService] = useState(null)

    const [showLoadingPopup, setShowLoadingPopup] = useState(false)
    const [showRedirectPopup, setShowRedirectPopup] = useState(false)
    const [fileRedirectUrl, setFileRedirectUrl] = useState('')
    const [showDeleteProjectPopup, setShowDeleteProjectPopup] = useState(false)

    const fetchFlowers = async () => {
        try {
            const response = await axiosPrivate.get(ARRANGEMENT_DATA_FETCH + id);

            const {arrangements, flowers, project, extras} = response?.data
            
            setArrangementData(arrangements || [])
            setFlowerData(flowers || [])
            setProjectData(project[0] || [])
            setExtraServicesData(extras || [])

            if(!project[0]) {
                navigateTo('/projects')
                setMessage('Invalid project ID')
            }
            
            const totalBudget = arrangements.reduce((value, arrangement) => {
                return value + (arrangement.clientcost * project[0]?.profitmargin)
              }, 0)

            setTotalBudget(totalBudget)

                           
        } catch (error) {
            console.log(error);
            setMessage(error.response?.data, true)
        }
    };

    const duplicateProject = async () => {
        try {
            console.log("duplicatin", id)
            const response = await axiosPrivate.post(DUPLICATE_PROJECT_URL, JSON.stringify({id}))
            setMessage('Project copied successfully', false)
            navigateTo('/projects/' + response.data)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    useEffect(() => {
        fetchFlowers();
    }, []);

    useEffect(() => {
        if (flowerData.length > 0) {
            const {aggregatedFlowerArray, flowersByArrangement} = aggregateFlowerData(flowerData)
            setShowFlowerData(aggregatedFlowerArray || []);
            setFlowersByArrangement(flowersByArrangement)
        }

        if (arrangementData.length > 0){
            const estimate = flowerData.reduce(countFlowerCostAndFlowerCostyProject, {totalFlowerCost: 0, totalFlowerCostByArrangement: {}})
            let totalAditional = extraServicesData.reduce((accumulator, service) => accumulator + parseFloat(service.clientcost * service.ammount) , 0)
            let totalClientFlowerCost = arrangementData.reduce((accumulator, arrang) => accumulator + (arrang.clientcost * arrang.arrangementquantity * arrang.installationtimes), 0)

            addAssignedBudget(estimate.totalFlowerCostByArrangement)
            setEstimatedFlowerCost(estimate.totalFlowerCost)
            let tempProjectStats = {}

            tempProjectStats.totalFlowerCost = totalClientFlowerCost
            tempProjectStats.totalExtrasCost = totalAditional
            tempProjectStats.totalProjectCost = tempProjectStats.totalFlowerCost + tempProjectStats.totalExtrasCost
            tempProjectStats.totalFlowerBudget = tempProjectStats.totalFlowerCost * projectData.profitmargin
            tempProjectStats.totalStaffBudget = tempProjectStats.totalProjectCost * projectData.staffbudget
            tempProjectStats.totalProjectProfit = tempProjectStats.totalProjectCost - tempProjectStats.totalFlowerBudget - tempProjectStats.totalStaffBudget - estimate.totalFlowerCost

            setProjectStats(tempProjectStats)

            updateArrangementData();
        }
    }, [flowerData, extraServicesData]);

    // this function checks if the arrangement has flowers assigned to it
    const updateArrangementData = () => {
        const updatedArrangementData = arrangementData.map((item) => ({
            ...item,
            hasFlowers: flowerData.some(
                (flower) => flower.arrangementid === item.arrangementid && flower.flowerid !== null
            ),
        }));
        setArrangementData(updatedArrangementData);
        
    };

    // this func calculates the cost of each arrangement and the total cost, its used in a reduce
    const countFlowerCostAndFlowerCostyProject = (value, flower) => {
        // adding the cost of all the flowers
        let thisflowerCost = flower.amount * flower.unitprice
        let tempTotalFlowerCost = value.totalFlowerCost + thisflowerCost
        
        //adding the cost of the flowers by their arrangement
        let tempTotalFlowerCostByArrangement = value.totalFlowerCostByArrangement
        
        // adding the flower cost to its arrangement
        if(!tempTotalFlowerCostByArrangement[flower.arrangementid]){
            tempTotalFlowerCostByArrangement[flower.arrangementid] = thisflowerCost
        } else tempTotalFlowerCostByArrangement[flower.arrangementid] = tempTotalFlowerCostByArrangement[flower.arrangementid] + thisflowerCost
        
        return {totalFlowerCost: tempTotalFlowerCost, totalFlowerCostByArrangement: tempTotalFlowerCostByArrangement}

    }

    const addAssignedBudget = (budget) => {
   
        const tempArrangementData = [...arrangementData]

        if (tempArrangementData.length == 0) return
        Object.entries(budget).forEach(([key, value]) => {
            const existingFlowerPriceIndex = tempArrangementData.findIndex(item => item.arrangementid == key)
            if(existingFlowerPriceIndex != -1){
                tempArrangementData[existingFlowerPriceIndex]["assignedBudget"] = value
            }
        })
        setArrangementData(tempArrangementData)
    }


    const handleArrangement = data => {
        if(!validateProjectIsOpen()) return
        navigateTo("/arrangement/" + data?.arrangementid, {state:{projectID: id}})
    }

    const closeProject = async () => {
        try {
            let res = {}
            if (!projectData.isclosed){
                res = await axiosPrivate.post(CLOSE_PROJECT_URL + id)
            } else {
                res = await axiosPrivate.post(OPEN_PROJECT_URL + id)
            }
            setMessage(res.data, false)
            fetchFlowers()            
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    const removeProject = async () => {
        try {
            await axiosPrivate.delete(DELETE_PROJECT_URL + id)
            setMessage('Project removed successfully', false)
            navigateTo('/projects')
        } catch (error) {
            setMessage(error.response?.data, true)
        } finally {
            setShowDeleteProjectPopup(false)
        }
    }

    const handleArrangementEdit = (e, arrData) => {
        if(!(userData.permissionlevel >= permissionsRequired['edit_arrangement'])) return
        if(!validateProjectIsOpen()) return
        e.stopPropagation()
        setEditArrangementPopupData(arrData)
        setShowArrangementEditPopup(true)
    }

    const handleCLickReemoveArrangement = (e, item) =>  {
        if(!(userData.permissionlevel >= permissionsRequired['remove_arrangement'])) return
        if(!validateProjectIsOpen()) return
        e.stopPropagation() 
        setDeletePopupData({show: true, deleteID:item.arrangementid})
    }

    const handleCreateArrangement = () => {
        if(!validateProjectIsOpen()) return
        setEditArrangementPopupData(undefined)
        setShowArrangementEditPopup(true)
    }

    const closeNewArrPopup = (refreshData) => {
        setShowArrangementEditPopup(false)
        setEditArrangementPopupData(undefined)
        if (refreshData == true) {
            fetchFlowers()
        }
    }

    const closeEditProject = (refreshData) => {
        setShowEditProjectPopup(false)
        if (refreshData == true) {
            fetchFlowers()
        }
    }

    const handleArrangementDelete = async () => {
        try {
            await axiosPrivate.delete(DELETE_ARRANGEMENT_URL + deletePopupData.deleteID)
            setDeletePopupData({show: false, deleteID: null})
            setMessage("Arrangement deleted successfully", false)
            fetchFlowers();
        } catch (error) {
            setMessage(error.response?.data, true)

        }
    }

    const handleMouseMove = (e) => {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    };
  
    const handleMouseEnter = (hoveredArrangement) => {
        setShowTooltip(true);
        setActualHoveredArr(hoveredArrangement)
    };
  
    const handleMouseLeave = () => {
      setShowTooltip(false);
      setActualHoveredArr(null)
    };

    const toggleFlowerChange = async (flowerid) => {
        if(!validateProjectIsOpen()) return
        setChangeFlowerID(flowerid)
        setChangeFlowersPopup(true)
    }

    const submitChangeStemInArrangements = async (newFlower) => {
        try {
            await axiosPrivate.post(CHANGE_FLOWER_IN_PROJECT_URL + id, JSON.stringify({previousflowerid:changeFlowerID, newflowerid:newFlower.flowerid}))
            setMessage('Flower Changed successfully.')
            fetchFlowers()
        } catch (error) {
            setMessage(error.response?.data, true)
        } finally {
            setChangeFlowerID(null)
        }
    }

    const downloadFlowerList = async () => {
        try {
            setShowLoadingPopup(true)

            let text = ''
    
            showFlowerData.forEach(item => {
                text += `${item.flowername}: ${item.totalstems} units`
                text += '\n'
            })
    
            if(text == '') {
                setMessage('No flowers are set for this project.')
                return
            }
            
            const documentId= await CreateFlowerOrder(auth.googleAccesToken, text)
            const url = 'https://docs.google.com/document/d/' + documentId
            
            setShowRedirectPopup(true)
            setFileRedirectUrl(url)
            window.open(url, '_blank').focus()
            
        } catch (error) {
            console.log("error", error)
            setMessage(error.response.data.error.message)
        } finally {
            setShowLoadingPopup(false)
        }

        /*
            let blob = new Blob([text], {type: 'text/plain'})
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.download = "flower_order.txt"
            link.href = url
            link.click();
        */
    }

    const validateProjectIsOpen = () => {
        if(projectData.isclosed) {
            setMessage(PROJECT_CLOSED_ERROR)
            return false
        }
        return true
    }

    const handleEditService = (serviceToEdit) => {
        if(!validateProjectIsOpen()) return
        setEditService(serviceToEdit)
        setShowServicePopup(true)
    }

    const handleSubmitExtraServices = async (expense) => {
        try {
            if (expense.aditionalid) {
                await axiosPrivate.patch(EDIT_EXPENSE_URL, JSON.stringify({serviceData: expense}))
            } else {
                await axiosPrivate.post(ADD_NEW_EXPENSE_URL, JSON.stringify({serviceData: expense, projectID: projectData.projectid}))
            }
            fetchFlowers()
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    const handleGeneratePPTslides = async () => {
        try {
            setShowLoadingPopup(true)
            const response = await axiosPrivate.post(GENERATE_PPT_SLIDE_URL, JSON.stringify({projectID: projectData.projectid}))
            const documentId = response.data 
            const url = 'https://docs.google.com/presentation/d/' + documentId
            setShowRedirectPopup(true)
            setFileRedirectUrl(url)
            
            window.open(url, '_blank').focus()
        } catch (error) {
            setMessage(error.response?.data, true)
        } finally {
            setShowLoadingPopup(false)
        }
    }

    const handleEditProjectData = () => {
        if(!validateProjectIsOpen()) return
        setShowEditProjectPopup(true)
    }

    const handleAddNewService = () => {
        if(!validateProjectIsOpen()) return
        setShowServicePopup(true)
    }

    const buttonOptions = [
        {
            text: 'Generate Floral Selection', 
            action: handleGeneratePPTslides,
            icon: <FiDownload/>,
            minPermissionLevel:permissionsRequired['download_projectppt']
        },
        {
            text: 'Add New Arrangement', 
            action: handleCreateArrangement,
            icon: <RiFlowerLine/>,
            minPermissionLevel:permissionsRequired['add_arrangement']
        },
        {
            text: 'Add New Service', 
            action: handleAddNewService,
            icon: '+',
            minPermissionLevel:permissionsRequired['add_arrangement']
        },
        {
            text: 'Edit Project Data', 
            action: handleEditProjectData,
            icon: <FiEdit/>,
            minPermissionLevel:permissionsRequired['edit_project_data']
        },
        {
            text: "Delete Project",
            action: () => setShowDeleteProjectPopup(true),
            icon: <FiTrash/>,
            minPermissionLevel: permissionsRequired['delete_project']
        },
        {
            text: "Duplicate Project",
            action: duplicateProject,
            icon: <FiCopy/>,
            minPermissionLevel: permissionsRequired['edit_project_data']
        },

        
    ]

    return (
        projectData ? <div className='container mx-auto pt-12 p-4 text-center page'>
            <Tooltip showTooltip={showTooltip} tooltipPosition={tooltipPosition}>{
                actualHoveredArr && flowersByArrangement[actualHoveredArr]?.map((flower, index) => {
                return <p key={index}>{flower.flowername} x {flower.amount}</p> })}
            </Tooltip>
            {projectData?.projectid && <FloatingMenuButton options={buttonOptions}/>}
            <ConfirmationPopup showPopup={deletePopupData.show} closePopup={() => setDeletePopupData({show: false, deleteID: null})} confirm={handleArrangementDelete}> 
                Are you sure you want to Delete this arrangement from the database?
            </ConfirmationPopup>
            <ConfirmationPopup showPopup={showDeleteProjectPopup} closePopup={() => setShowDeleteProjectPopup(false)} confirm={removeProject}>
                <h1>Are you sure you want to delete this project?</h1>
                <p>this changes cannot be reverted</p>
            </ConfirmationPopup>
            <EditArrangementPopup 
                showPopup={showArrangementEditPopup} 
                arrangementData={editArrangementPopupData} 
                projectData={projectData} 
                closePopup={closeNewArrPopup}/>
            <EditProjectData
                showPopup={showEditProjectPopup}
                closePopup={closeEditProject}
                projectData={projectData}>
            </EditProjectData>
            <InvoiceAddFlowerToProjectPopup
                showPopup={showChangeFlowersPopup}
                submitFunction={submitChangeStemInArrangements}
                closePopup={() => {
                    setChangeFlowersPopup(false)
                    setChangeFlowerID(null)
                }}
            />
            <AddAditionalExpensePopup
                showPopup={showServicePopup}
                closePopup={() => {
                    setEditService(null)
                    setShowServicePopup(false)
                }}
                submitFunc = {handleSubmitExtraServices}
                projectData={projectData}
                editExpense={editService}
            />
            <LoadingPopup
                showPopup={showLoadingPopup}>
                    <h1>Creating your document</h1>
                    <p>Please wait and you will be redirected</p>
            </LoadingPopup>
            <RedirectToFilePopup
                showPopup={showRedirectPopup && fileRedirectUrl}
                closePopup={() => setShowRedirectPopup(false)}
                url={fileRedirectUrl}>
            </RedirectToFilePopup>
            <div className='grid grid-cols-3 mb-4'>
                <button className='go-back-button col-span-1' onClick={() => navigateTo('/projects')} >Go Back</button>
                <h2 className='col-span-1'>Project Overview</h2>
            </div>
            <div>
                <h3>{projectData?.projectdescription}</h3>
                <p className={projectData?.isclosed ? 'text-red-500' : 'text-green-700'}>Project status: {projectData?.isclosed ? 'Closed': 'Open'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-10 font-bold my-5">
                <div>
                    <p>Client: {projectData?.projectclient}</p>
                    <p>Project Start Date: {projectData?.projectdate}</p>
                </div>
                <div className="md:col-start-2">
                    <p>Project Contact: {projectData?.contactname}</p>
                    <p>Project End Date: {projectData?.projectenddate}</p>
                    
                </div>
            </div>
            <div className='table-container h-[40vh]'>
                <TableHeaderSort
                    headers={{'Type': ' ', 'Description': ' ','Location': ' ', 'Quantity': ' ', 'Flower Budget': ' ', 'Assigned Budget': ' ','"Installation Quantity per Week': ' ', 'Quantity of Weeks per Billing Period': ' ' , 'Status': ' ', 'Admin': ' '}}
                    styles={{"tbodyStyles": 'hover:cursor-pointer'}}
                >
                    {arrangementData?.map((item, index) => (
                        <tr key={index}  
                            onClick={() => handleArrangement(item)}      
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => handleMouseEnter(item.arrangementid)}
                            onMouseLeave={handleMouseLeave}>
                            <td>{item?.typename}</td>
                            <td>{item?.arrangementdescription}</td>
                            <td>{item?.arrangementlocation}</td>
                            <td>{item?.arrangementquantity}</td>
                            <td>{toCurrency((item?.clientcost) * projectData.profitmargin)}</td>
                            <td>{toCurrency(item?.assignedBudget)}</td>
                            <td>{item.installationtimes}</td>
                            <td>{item.timesbilled}</td>
                            <td className={item?.hasFlowers ? 'bg-green-500' : 'bg-yellow-500'}>
                                {item?.hasFlowers ? 'Created' : 'Design Needed'}
                            </td>
                            <td className='border-b p-2 text-center'>
                                <button onMouseEnter={handleMouseLeave} className='go-back-button' onClick={(e) => handleArrangementEdit(e, item)}>Edit</button>
                                <button onMouseEnter={handleMouseLeave} className='go-back-button ml-2' onClick={(e) => handleCLickReemoveArrangement(e, item)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </TableHeaderSort>
            </div>
                <div className="flex my-4">
                    <div className="pr-4 w-3/6 ">
                        <h2>Flower Data</h2>
                        <div className='table-container h-[20vh] mt-2'>
                            <TableHeaderSort
                                headers={{'Flower Name': ' ', 'Total Stems': ' ', 'Unit Price': ' ', 'Estimated Cost': ' ', 'Change Stem': ' '}}>
                                {showFlowerData?.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item?.flowername}</td>
                                        <td>{item?.totalstems}</td>
                                        <td>{toCurrency(item?.unitprice)}</td>
                                        <td>{toCurrency(item?.estimatedcost)}</td>
                                        <td><button className='go-back-button' onClick={() => toggleFlowerChange(item.flowerid)}>Change stem</button></td>
                                    </tr>
                                ))}
                            </TableHeaderSort>
                            
                        </div>

                        <div className='flex mt-5'>
                            <div className='flex-row'>
                                <button className='buton-secondary mx-3 my-2' onClick={downloadFlowerList}>Download Shopping List</button>
                                <button className='buton-secondary' onClick={closeProject} >{projectData.isclosed ? "Open Project": "Close Project"}</button>
                            </div>
                            <div className='flex-row text-left ml-5'>
                                <p>Flower budget: {toCurrency(totalBudget)}</p>
                                <p>Estimate spent in flowers: {toCurrency(estimatedFlowerCost)}</p>
                                <p>Diference: <span className={totalBudget-estimatedFlowerCost > 0 ? 'text-green-700' : 'text-red-700'}>{toCurrency(totalBudget-estimatedFlowerCost)}</span></p>
                            </div>
                        </div>
                    </div>
                    <RestrictedComponent permissionRequired={permissionsRequired['veiw_project_statistics']}>
                        <div className="pr-4 w-3/6 ">
                            <h2>Extra Services</h2>
                            <div className='table-container h-[20vh] mt-2'>
                                <TableHeaderSort
                                    headers={{'Description': ' ', 'Cost to Client': ' ', 'Quantity': ' '}}>
                                    {extraServicesData?.map((item, index) => (
                                        <tr key={index} onClick={() => handleEditService(item)}>
                                            <td>{item?.description}</td>
                                            <td>{toCurrency(item?.clientcost)}</td>
                                            <td>{item?.ammount}</td>
                                        </tr>
                                        ))}
                                </TableHeaderSort>
                            </div>
                            <div className='text-left ml-5 grid grid-cols-2'>
                                <div className='grid-col'>
                                    <p className='mr-4'>Total extras costs: {toCurrency(projectStats.totalExtrasCost)}</p>
                                    <p className='mr-4'>Total flower costs: {toCurrency(projectStats.totalFlowerCost)}</p>
                                    <p className='mr-4'>Total project cost: {toCurrency(projectStats.totalProjectCost)}</p>
                                </div>
                                <div className='grid-col'>
                                    <p className='mr-4'>Total staff budget: {toCurrency(projectStats.totalStaffBudget)}</p>
                                    <p>Estimate spent in flowers {toCurrency(estimatedFlowerCost)}</p>
                                    <p>Expected Project Profit: <span className={projectStats.totalProjectProfit>0? 'text-green-700' : 'text-red-700'}>{toCurrency(projectStats.totalProjectProfit)}</span> </p>
                                </div>
                            </div>
                        </div>
                    </RestrictedComponent>
                </div>
        </div> : <p>Loading</p>
    );
}
