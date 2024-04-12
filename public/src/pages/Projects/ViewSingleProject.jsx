import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { aggregateFlowerData } from '../../utls/flowerAggregation/aggregateFlowerDataArrangements';
import { BASE_TD_STYLE } from '../../styles';
import { useNavigate } from 'react-router-dom'
import useAlert from '../../hooks/useAlert';
import EditArrangementPopup from '../../components/ProjectView/EditArrangementPopup';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import Tooltip from '../../components/Tooltip';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton';
import EditProjectData from '../../components/ProjectView/EditProjectData';
import InvoiceAddFlowerToProjectPopup from '../../components/InvoiceCreation/InvoiceAddFlowerToProjectPopup';
import { FiDownload, FiEdit } from "react-icons/fi";
import useAuth from '../../hooks/useAuth';
import { permissionsRequired } from '../../utls/permissions';
import AddAditionalExpensePopup from '../../components/Popups/AddAditionalExpensePopup'
import { toCurrency } from '../../utls/toCurrency';
import RestrictedComponent from '../../components/RestrictedComponent';

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/';
const CLOSE_PROJECT_URL = 'api/projects/close/'
const OPEN_PROJECT_URL = 'api/projects/open/'
const DELETE_ARRANGEMENT_URL = 'api/arrangements/'
const CHANGE_FLOWER_IN_PROJECT_URL = 'api/projects/editflower/'
const ADD_NEW_EXPENSE_URL = '/api/extraServices'
const EDIT_EXPENSE_URL = '/api/extraServices'

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
                return value + (arrangement.clientcost * (1 - project[0]?.profitmargin))
              }, 0)

            setTotalBudget(totalBudget)

                           
        } catch (error) {
            console.log(error);
            setMessage(error.response?.data?.message, true)
        }
    };

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
            let totalAditional = extraServicesData.reduce((accumulator, service) => accumulator + parseFloat(service.clientcost) , 0)
            let totalClientFlowerCost = arrangementData.reduce((accumulator, arrang) => accumulator + arrang.clientcost * arrang.arrangementquantity, 0)

            addAssignedBudget(estimate.totalFlowerCostByArrangement)
            setEstimatedFlowerCost(estimate.totalFlowerCost)
            let tempProjectStats = {}

            tempProjectStats.totalFlowerCost = totalClientFlowerCost
            tempProjectStats.totalExtrasCost = totalAditional
            tempProjectStats.totalProjectCost = tempProjectStats.totalFlowerCost + tempProjectStats.totalExtrasCost
            tempProjectStats.totalFlowerBudget = tempProjectStats.totalFlowerCost * (1-projectData.profitmargin)
            tempProjectStats.totalStaffBudget = tempProjectStats.totalProjectCost * projectData.staffbudget
            tempProjectStats.totalProjectProfit = tempProjectStats.totalProjectCost - tempProjectStats.totalFlowerBudget - tempProjectStats.totalStaffBudget - estimate.totalFlowerCost

            setProjectStats(tempProjectStats)

            updateArrangementData();
        }
    }, [flowerData]);

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
            setMessage(error.response?.data?.message, true)
        }
    }

    const handleArrangementEdit = (e, arrData) => {
        if(!(userData.permissionlevel >= permissionsRequired['edit_arrangement'])) return
        e.stopPropagation()
        setEditArrangementPopupData(arrData)
        setShowArrangementEditPopup(true)
    }

    const handleCLickReemoveArrangement = (e) =>  {
        if(!(userData.permissionlevel >= permissionsRequired['remove_arrangement'])) return
        e.stopPropagation() 
        setDeletePopupData({show: true, deleteID:item.arrangementid})
    }

    const handleCreateArrangement = () => {
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
            setMessage(error.response?.data?.message, true)

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
        setChangeFlowerID(flowerid)
        setChangeFlowersPopup(true)
    }

    const submitChangeStemInArrangements = async (newFlower) => {
        try {
            await axiosPrivate.post(CHANGE_FLOWER_IN_PROJECT_URL + id, JSON.stringify({previousflowerid:changeFlowerID, newflowerid:newFlower.flowerid}))
            setMessage('Flower Changed successfully.')
            fetchFlowers()
        } catch (error) {
            setMessage(error.response?.data?.message, true)
        } finally {
            setChangeFlowerID(null)
        }
    }

    const downloadFlowerList = () => {
        let text = ''
        showFlowerData.forEach(item => {
            text += `${item.flowername} ${item.flowercolor} x ${item.totalstems}`
            text += '\n'
        })

        let blob = new Blob([text], {type: 'text/plain'})
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = "flower_order.txt"
        link.href = url
        link.click();

    }

    const handleEditService = (serviceToEdit) => {
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
            setMessage(error.response?.data?.message, true)
        }
    }

    const buttonOptions = [
        {
            text: 'Add New Arrangement', 
            action: handleCreateArrangement,
            icon: '+',
            minPermissionLevel:permissionsRequired['add_arrangement']
        },
        {
            text: 'Edit project Data', 
            action: () =>{setShowEditProjectPopup(true)},
            icon: <FiEdit/>,
            minPermissionLevel:permissionsRequired['edit_project_data']
        },
        {
            text: 'Download ppt slides', 
            action: () => {},
            icon: <FiDownload/>,
            minPermissionLevel:permissionsRequired['edit_project_data']
        },
        {
            text: 'Add new service', 
            action: () => {setShowServicePopup(true)},
            icon: '+',
            minPermissionLevel:permissionsRequired['edit_project_data']
        }
    ]

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>
            <Tooltip showTooltip={showTooltip} tooltipPosition={tooltipPosition}>{
                actualHoveredArr && flowersByArrangement[actualHoveredArr]?.map((flower, index) => {
                return <p key={index}>{flower.flowername} x {flower.amount}</p> })}
            </Tooltip>
            <FloatingMenuButton options={buttonOptions}/>
            <ConfirmationPopup showPopup={deletePopupData.show} closePopup={() => setDeletePopupData({show: false, deleteID: null})} confirm={handleArrangementDelete}> 
                Are you sure you want to Delete this arrangement from the database?
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
                closePopup={() => setShowServicePopup(false)}
                submitFunc = {handleSubmitExtraServices}
                projectData={projectData}
                editExpense={editService}
            />
            
            <div className='grid grid-cols-3 mb-4'>
                <button className='go-back-button col-span-1' onClick={() => navigateTo('/projects')} >Go Back</button>
                <h2 className='col-span-1'>Project Overview</h2>
            </div>
            <p className={projectData?.isclosed ? 'text-red-500' : 'text-green-700'}>Project status: {projectData?.isclosed ? 'Closed': 'Open'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-10 font-bold my-5">
                <div>
                    <p>Client: {projectData?.projectclient}</p>
                    <p>Project Date: {projectData?.projectdate}</p>
                </div>
                <div className="md:col-start-2">
                    <p>Project Contact: {projectData?.projectcontact}</p>
                    <p>Project Description: {projectData?.projectdescription}</p>
                </div>
            </div>
            <div className='table-container h-[20vh]'>
                <TableHeaderSort
                headers={{'Type': ' ', 'Description': ' ', 'Quantity': ' ', 'Flower Budget': ' ', 'Assigned Budget': ' ', 'Status': ' ', 'admin': ' '}}>
                    {arrangementData?.map((item, index) => (
                        <tr key={index}  
                            onClick={() => handleArrangement(item)}      
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => handleMouseEnter(item.arrangementid)}
                            onMouseLeave={handleMouseLeave}>
                            <td>{item?.typename}</td>
                            <td>{item?.arrangementdescription}</td>
                            <td>{item?.arrangementquantity}</td>
                            <td>${toCurrency((item?.clientcost) * (1 - projectData.profitmargin))}</td>
                            <td>${item?.assignedBudget}</td>
                            <td>
                                {item?.hasFlowers ? 'Created' : 'Design Needed'}
                            </td>
                            <td className={BASE_TD_STYLE}>
                                <button onMouseEnter={handleMouseLeave} className='go-back-button' onClick={(e) => handleArrangementEdit(e, item)}>Edit</button>
                                <button onMouseEnter={handleMouseLeave} className='go-back-button ml-2' onClick={handleCLickReemoveArrangement}>remove</button>
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
                                    <tr key={index} >
                                        <td>{item?.flowername}</td>
                                        <td>{item?.totalstems}</td>
                                        <td>${toCurrency(item?.unitprice)}</td>
                                        <td>${toCurrency(item?.estimatedcost)}</td>
                                        <td><button className='go-back-button' onClick={() => toggleFlowerChange(item.flowerid)}>Change stem</button></td>
                                    </tr>
                                    ))}
                            </TableHeaderSort>
                            
                        </div>

                        <div className='flex mt-5'>
                            <div className='flex-row'>
                                <button className='buton-secondary mx-3 my-2' onClick={downloadFlowerList} >Download Flower Order</button>
                                <button className='buton-secondary' onClick={closeProject} >{projectData.isclosed ? "Open project": "Close project"}</button>
                            </div>
                            <div className='flex-row text-left ml-5'>
                                <p>Flower budget: ${toCurrency(totalBudget)}</p>
                                <p>Estimate spent in flowers: ${toCurrency(estimatedFlowerCost)}</p>
                                <p>Diference: <span className={totalBudget-estimatedFlowerCost > 0 ? 'text-green-700' : 'text-red-700'}>${toCurrency(totalBudget-estimatedFlowerCost)}</span></p>
                            </div>
                        </div>
                    </div>
                    <RestrictedComponent permissionRequired={permissionsRequired['veiw_project_statistics']}>
                        <div className="pr-4 w-3/6 ">
                            <h2>Extra Services</h2>
                            <div className='table-container h-[20vh] mt-2'>
                                <TableHeaderSort
                                    headers={{'description': ' ', 'clientcost': ' '}}>
                                    {extraServicesData?.map((item, index) => (
                                        <tr key={index} onClick={() => handleEditService(item)}>
                                            <td>{item?.description}</td>
                                            <td>${toCurrency(item?.clientcost)}</td>
                                        </tr>
                                        ))}
                                </TableHeaderSort>
                            </div>
                            <div className='text-left ml-5 grid grid-cols-2'>
                                <div className='grid-col'>
                                    <p className='mr-4'>Total extras costs: ${toCurrency(projectStats.totalExtrasCost)}</p>
                                    <p className='mr-4'>Total flower costs: ${toCurrency(projectStats.totalFlowerCost)}</p>
                                    <p className='mr-4'>Total project cost: ${toCurrency(projectStats.totalProjectCost)}</p>
                                </div>
                                <div className='grid-col'>
                                    <p className='mr-4'>Total staff budget: ${toCurrency(projectStats.totalStaffBudget)}</p>
                                    <p>Estimate spent in flowers ${toCurrency(estimatedFlowerCost)}</p>
                                    <p>Expected Project Profit: <span className={projectStats.totalProjectProfit>0? 'text-green-700' : 'text-red-700'}>${toCurrency(projectStats.totalProjectProfit)}</span> </p>
                                </div>
                            </div>
                        </div>
                    </RestrictedComponent>
                </div>
        </div>    
    );
}
