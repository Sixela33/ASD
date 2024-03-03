import React, { useEffect, useState } from 'react';
import { redirect, useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { aggregateFlowerData } from '../../utls/aggregateFlowerDataArrangements';
import { BASE_TD_STYLE } from '../../styles';
import { useNavigate } from 'react-router-dom'
import useAlert from '../../hooks/useAlert';
import EditArrangementPopup from '../../components/ProjectView/EditArrangementPopup';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';
import Tooltip from '../../components/Tooltip';
import ConfirmationPopup from '../../components/ConfirmationPopup'

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/';
const CLOSE_PROJECT_URL = 'api/projects/close/'
const OPEN_PROJECT_URL = 'api/projects/open/'
const DELETE_ARRANGEMENT_URL = 'api/arrangements/'

export default function ViewProject() {
    const { id } = useParams();
    const navigateTo = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()

    const [arrangementData, setArrangementData] = useState([]);
    const [flowerData, setFlowerData] = useState([]);
    const [showFlowerData, setShowFlowerData] = useState([]);
    const [projectData, setProjectData] = useState([])
    
    const [flowersByArrangement, setFlowersByArrangement] = useState(null)
    const [actualHoveredArr, setActualHoveredArr] = useState(null)

    const [estimatedFlowerCost, setEstimatedFlowerCost] = useState(0)
    const [totalBudget, setTotalBudget] = useState(0)
    
    const [showArrangementEditPopup, setShowArrangementEditPopup] = useState(false)
    const [editArrangementPopupData, setEditArrangementPopupData] = useState(null)

    const [deletePopupData, setDeletePopupData] = useState({show: false, deleteID: null})

    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const fetchFlowers = async () => {
        try {
            const response = await axiosPrivate.get(ARRANGEMENT_DATA_FETCH + id);

            const {arrangements, flowers, project} = response?.data
            
            setArrangementData(arrangements || []);
            setFlowerData(flowers || []);
            setProjectData(project[0] || [])
            
            const totalBudget = arrangements.reduce((value, arrangement) => {
                return value + (arrangement.clientcost * (1 - project[0]?.profitmargin))
              }, 0)

            setTotalBudget(totalBudget)

                           
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchFlowers();
    }, []);

    useEffect(() => {
        if (flowerData.length > 0) {
            const {aggregatedFlowerArray, separatedByArrangement, flowersByArrangement} = aggregateFlowerData(flowerData)
            setShowFlowerData(aggregatedFlowerArray || []);
            setFlowersByArrangement(flowersByArrangement)
        }

        if (arrangementData.length > 0){
            const estimate = flowerData.reduce(countFlowerCostAndFlowerCostyProject, {totalFlowerCost: 0, totalFlowerCostByArrangement: {}})
        
            addAssignedBudget(estimate.totalFlowerCostByArrangement)
            setEstimatedFlowerCost(estimate.totalFlowerCost)
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
        e.stopPropagation()
        setEditArrangementPopupData(arrData)
        setShowArrangementEditPopup(true)
    }

    const handleArrangementDelete = async () => {
        try {
            console.log(deletePopupData)
            await axiosPrivate.delete(DELETE_ARRANGEMENT_URL + deletePopupData.deleteID)
            setDeletePopupData({show: false, deleteID: null})
            setMessage("Arrangement deleted successfully", false)
            fetchFlowers();
        } catch (error) {
            setMessage(error.response?.data?.message, true)

        }
    }

    const closePopup = (refreshData) => {
        setShowArrangementEditPopup(false)
        if (refreshData == true) {
            fetchFlowers()
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
    
    return (
        <div className="container mx-auto my-8 text-center">
            <EditArrangementPopup showPopup={showArrangementEditPopup} arrangementData={editArrangementPopupData} projectData={projectData} closePopup={closePopup}/>
            <Tooltip showTooltip={showTooltip} tooltipPosition={tooltipPosition}>{
                actualHoveredArr && flowersByArrangement[actualHoveredArr]?.map((flowe, index) => {
                return <p key={index}>{flowe.flowername} x {flowe.amount}</p>})}
            </Tooltip>
            <ConfirmationPopup showPopup={deletePopupData.show} closePopup={() => setDeletePopupData({show: false, deleteID: null})} confirm={handleArrangementDelete}> 
                Are you sure you want to Delete this arrangement from the database?
            </ConfirmationPopup>
            <div className="mb-4 ">
                <button onClick={() => navigateTo('/projects')} className="text-blue-500 hover:text-blue-700">go back</button>
                <h2 className="text-2xl font-bold mb-4 text-center">Project Overview</h2>
            </div>
            <p>Project status: {projectData?.isclosed ? 'Closed': 'Open'}</p>
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
            <div className="flex flex-col items-center mb-8 overflow-auto h-[20vh]">
                <TableHeaderSort
                headers={{'Type': ' ', 'Description': ' ', 'Quantity': ' ', 'Flower Budget': ' ', 'Assigned Budget': ' ', 'Status': ' ', 'admin': ' '}}>
                    {arrangementData?.map((item, index) => (
                        <tr key={index} className='bg-gray-300 ' 
                            onClick={() => handleArrangement(item)}      
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => handleMouseEnter(item.arrangementid)}
                            onMouseLeave={handleMouseLeave}>
                            <td className={BASE_TD_STYLE}>{item?.typename}</td>
                            <td className={BASE_TD_STYLE}>{item?.arrangementdescription}</td>
                            <td className={BASE_TD_STYLE}>{item?.arrangementquantity}</td>
                            <td className={BASE_TD_STYLE}>${parseFloat((item?.clientcost) * (1 - projectData.profitmargin)).toFixed(2)}</td>
                            <td className={BASE_TD_STYLE}>${item?.assignedBudget}</td>
                            <td className={BASE_TD_STYLE}>
                                {item?.hasFlowers ? 'Created' : 'Design Needed'}
                            </td>
                            <td className={BASE_TD_STYLE} onMouseEnter={handleMouseLeave}>
                                <button className="text-blue-500 hover:text-blue-700" onClick={(e) => handleArrangementEdit(e, item)}>Edit</button>
                                <button className="text-blue-500 hover:text-blue-700 m-2" onClick={(e) =>  {e.stopPropagation(); setDeletePopupData({show: true, deleteID:item.arrangementid})}}>remove</button>
                            </td>
                        </tr>
                    ))}
                </TableHeaderSort>
            </div>
            <div className="flex mb-8">
                <div className="pr-4 w-1/2 ">
                    <h2 className="text-lg font-bold mb-4">Flower Data</h2>
                    <div className='overflow-auto h-[20vh] w-full mt-2'>
                        <TableHeaderSort
                            headers={{'Flower Name': ' ', 'Total Stems': ' ', 'Unit Price': ' ', 'Estimated Cost': ' ', 'Change Stem': ' '}}>
                            {showFlowerData?.map((item, index) => (
                                <tr key={index} className='bg-gray-300 '>
                                    <td className={BASE_TD_STYLE}>{item?.flowername}</td>
                                    <td className={BASE_TD_STYLE}>{item?.totalstems}</td>
                                    <td className={BASE_TD_STYLE}>${parseFloat(item?.unitprice).toFixed(2)}</td>
                                    <td className={BASE_TD_STYLE}>${parseFloat(item?.estimatedcost).toFixed(2)}</td>
                                    <td className={BASE_TD_STYLE}><button className="text-blue-500 hover:text-blue-700">Change stem</button></td>
                                </tr>
                                ))}
                        </TableHeaderSort>
                    </div>

                    <div className='flex mt-5'>
                        <div className='flex-row'>
                            <button className='bg-gray-300 font-bold py-2 px-4 mx-3'>Generate pptslides</button>
                            <button onClick={closeProject} className='bg-gray-300 font-bold py-2 px-4'>{projectData.isclosed ? "Open project": "Close project"}</button>
                        </div>
                        <div className='flex-row text-left ml-5'>
                            <p>Estimated Flower cost: ${parseFloat(estimatedFlowerCost).toFixed(2)}</p>
                            <p>Flower budget: ${parseFloat(totalBudget).toFixed(2)}</p>
                            <p className={totalBudget-estimatedFlowerCost > 0 ? '' : 'text-red-700'}>Diference: ${parseFloat(totalBudget-estimatedFlowerCost).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>    
    );
}
