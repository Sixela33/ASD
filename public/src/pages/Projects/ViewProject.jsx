import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { aggregateFlowerData } from '../../utls/aggregateFlowerDataProject';
import { BASE_TD_STYLE } from '../../styles';
import { useNavigate } from 'react-router-dom'
import useAlert from '../../hooks/useAlert';
import EditArrangementPopup from '../../components/ProjectView/EditArrangementPopup';

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/';
const CLOSE_PROJECT_URL = 'api/projects/close/'
const OPEN_PROJECT_URL = 'api/projects/open/'

export default function ViewProject() {
    const { id } = useParams();
    const navigateTo = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()

    const [arrangementData, setArrangementData] = useState([]);
    const [flowerData, setFlowerData] = useState([]);
    const [showFlowerData, setShowFlowerData] = useState([]);
    const [projectData, setProjectData] = useState([])

    const [estimatedFlowerCost, setEstimatedFlowerCost] = useState(0)
    const [totalBudget, setTotalBudget] = useState(0)
    
    const [showArrangementEditPopup, setShowArrangementEditPopup] = useState(false)
    const [editArrangementPopupData, setEditArrangementPopupData] = useState(null)

    const fetchFlowers = async () => {
        try {
            const response = await axiosPrivate.get(ARRANGEMENT_DATA_FETCH + id);

            const {arrangements, flowers, project} = response?.data
            
            setArrangementData(arrangements || []);

            const totalBudget = arrangements.reduce((value, arrangement) => {
                return value + (arrangement.clientcost * (1 - projectData.profitmargin))
              }, 0)

            setTotalBudget(parseFloat(totalBudget).toFixed(2))
            setFlowerData(flowers || []);
            setProjectData(project[0] || [])
                           
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchFlowers();
    }, []);

    useEffect(() => {
        if (flowerData.length > 0) {
            const sortedFlowers = aggregateFlowerData(flowerData)
    
            setShowFlowerData(sortedFlowers[0] || []);
   
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

    const closePopup = (refreshData) => {
        setShowArrangementEditPopup(false)
        if (refreshData == true) {
            fetchFlowers()
        }
    }

    return (
        <div className="container mx-auto my-8 text-center">
            <EditArrangementPopup showPopup={showArrangementEditPopup} arrangementData={editArrangementPopupData} projectData={projectData} closePopup={closePopup}/>
            <div className="mb-4 ">
                <button onClick={() => navigateTo('/projects')} className="text-blue-500 hover:text-blue-700">go back</button>
                <h2 className="text-2xl font-bold mb-4 text-center">Project Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-10 font-bold">
                <div className='grid grid-row'>
                    <p>Project is closed: {projectData?.isclosed ? 'Yes' : 'No'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p>Client: {projectData?.projectclient}</p>
                        <p>Project Date: {projectData?.projectdate}</p>
                    </div>
                    <div className="md:col-start-2">
                        <p>Project Contact: {projectData?.projectcontact}</p>
                        <p>Project Description: {projectData?.projectdescription}</p>
                    </div>
                </div>
            </div>


            <div className="flex flex-col items-center mb-8">
                <table className="w-3/4 table-fixed">
                    <thead>
                        <tr>
                            {['Type', 'Description', 'Quantity', 'Flower Budget', 'Assigned Budget', 'Status', 'admin'].map(
                                (name, index) => (
                                    <th key={index} className="border p-2">
                                        {name}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {arrangementData?.map((item, index) => (
                            <tr key={index} className='bg-gray-300 ' onClick={() => handleArrangement(item)}>
                                <td className={BASE_TD_STYLE}>{item?.typename}</td>
                                <td className={BASE_TD_STYLE}>{item?.arrangementdescription}</td>
                                <td className={BASE_TD_STYLE}>{item?.arrangementquantity}</td>
                                <td className={BASE_TD_STYLE}>${parseFloat((item?.clientcost) * (1 - projectData.profitmargin)).toFixed(2)}</td>
                                <td className={BASE_TD_STYLE}>${item?.assignedBudget}</td>
                                <td className={BASE_TD_STYLE}>
                                    {item?.hasFlowers ? 'Created' : 'Design Needed'}
                                </td>
                                <td className={BASE_TD_STYLE}>
                                    <button className="text-blue-500 hover:text-blue-700" onClick={(e) => handleArrangementEdit(e, item)}>Edit arrangement</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                
            </div>
            <div className="flex mb-8">
                <div className="w-1/2 pr-4">
                    <h2 className="text-lg font-bold mb-4">Flower Data</h2>
                    <table className="w-full">
                        <thead>
                            <tr>
                                {['Flower Name', 'Total Stems', 'Unit Price', 'Estimated Cost', 'Change Stem'].map(
                                    (name, index) => (
                                        <th key={index} className="border p-2">
                                            {name}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {showFlowerData?.map((item, index) => (
                                <tr key={index} className='bg-gray-300 '>
                                    <td className={BASE_TD_STYLE}>{item?.flowername}</td>
                                    <td className={BASE_TD_STYLE}>{item?.totalstems}</td>
                                    <td className={BASE_TD_STYLE}>${parseFloat(item?.unitprice).toFixed(2)}</td>
                                    <td className={BASE_TD_STYLE}>${parseFloat(item?.estimatedcost).toFixed(2)}</td>
                                    <td className={BASE_TD_STYLE}><button className="text-blue-500 hover:text-blue-700">Change stem</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                <div className="w-1/2">
                    {/* Duplicate the flower data table for the second set */}
                    <h2 className="text-lg font-bold mb-4">Worker data (WIP)</h2>
                    <table className="w-full">
                        <thead>
                            <tr>
                                {['Flower Name', 'Total Stems', 'Unit Price', 'Estimated Cost'].map(
                                    (name, index) => (
                                        <th key={index} className="border p-2">
                                            {name}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {showFlowerData.map((item, index) => (
                                <tr key={index} className='bg-gray-300 '>
                                    <td className={BASE_TD_STYLE}>{item?.flowername}</td>
                                    <td className={BASE_TD_STYLE}>{item?.totalstems}</td>
                                    <td className={BASE_TD_STYLE}>{item?.unitprice}</td>
                                    <td className={BASE_TD_STYLE}>{item?.estimatedcost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>    
    );
}
