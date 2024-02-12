import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { aggregateFlowerData } from '../../utls/aggregateFlowerDataProject';
import { BASE_TD_STYLE } from '../../styles';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/';
const CREATE_ARRANGEMENT_URL = '/arrangement/'
export default function ViewProject() {
    const { id } = useParams();
    const location = useLocation();
    const navigateTo = useNavigate();

    const projectData = location?.state

    const axiosPrivate = useAxiosPrivate();
    const [arrangementData, setArrangementData] = useState([]);
    const [flowerData, setFlowerData] = useState([]);
    const [showFlowerData, setShowFlowerData] = useState([]);

    const [estimatedFlowerCost, setEstimatedFlowerCost] = useState(0)
    const [totalBudget, setTotalBudget] = useState(0)

    useEffect(() => {
        const fetchFlowers = async () => {
            try {
                const response = await axiosPrivate.get(ARRANGEMENT_DATA_FETCH + id);
                console.log(response)
                
                setArrangementData(response?.data?.arrangements || []);
    
                const totalBudget = response?.data?.arrangements.reduce((value, arrangement) => {
                    return value + arrangement.flowerbudget
                  }, 0)
                setTotalBudget(totalBudget)
                setFlowerData(response?.data?.flowers || []);
                               
            } catch (error) {
                console.log(error);
            }
        };

        fetchFlowers();
    }, []);

    useEffect(() => {
        if (flowerData.length > 0) {
            const sortedFlowers = aggregateFlowerData(flowerData)
    
            if (sortedFlowers[0]){
                setShowFlowerData(sortedFlowers[0]);
            } else {
                setShowFlowerData([])
            }
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

    const countFlowerCostAndFlowerCostyProject = (value, flower) => {
        // adding the cost of all the flowers
        let thisflowerCost = flower.amount * flower.unitprice
        let tempTotalFlowerCost = value.totalFlowerCost + thisflowerCost
        
        //adding the cost of the flowers by their arrangement
        let tempTotalFlowerCostByArrangement = value.totalFlowerCostByArrangement
        
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
        navigateTo(CREATE_ARRANGEMENT_URL + data?.arrangementid)
    }

    return (
        <div className="container mx-auto my-8 text-center">
            <div className="mb-4 ">
                <Link to="/projects" className="text-blue-500 hover:text-blue-700">Go back</Link>
                <h2 className="text-2xl font-bold mb-4 text-center">Project Overview</h2>
            </div>
            <div className="grid grid-row md:grid-cols-2 ml-10 font-bold">
                <div className='grid-row'>
                    <p>Client: {projectData.projectclient}</p>
                    <p>projectdate: {projectData.projectdate}</p>
                </div>
                <div className='grid-row'>
                    <p>projectcontact: {projectData.projectcontact}</p>
                    <p>projectdescription: {projectData.projectdescription}</p>
                </div>
            </div>
            <div className="flex flex-col items-center mb-8">
                <table className="w-3/4 table-fixed">
                    <thead>
                        <tr>
                            {['Type', 'Description', 'Quantity', 'Flower Budget', 'Assigned Budget', 'Status'].map(
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
                                <td className={BASE_TD_STYLE}>{item?.arrangementtype}</td>
                                <td className={BASE_TD_STYLE}>{item?.arrangementdescription}</td>
                                <td className={BASE_TD_STYLE}>{item?.arrangementquantity}</td>
                                <td className={BASE_TD_STYLE}>{item?.flowerbudget}</td>
                                <td className={BASE_TD_STYLE}>{item?.assignedBudget}</td>
                                <td className={BASE_TD_STYLE}>
                                    {item?.hasFlowers ? 'Created' : 'Design Needed'}
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
                                    <td className={BASE_TD_STYLE}>{item?.unitprice}</td>
                                    <td className={BASE_TD_STYLE}>{item?.estimatedcost}</td>
                                    <td className={BASE_TD_STYLE}><button className="text-blue-500 hover:text-blue-700">Change stem</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='flex mt-5'>
                        <div className='flex-row'>
                            <button className='bg-gray-300 font-bold py-2 px-4'>Generate pptslides</button>
                        </div>
                        <div className='flex-row text-left ml-5'>
                            <p>Estimated Flower cost: {estimatedFlowerCost}</p>
                            <p>Flower budget: {totalBudget}</p>
                            <p>Diference: {totalBudget-estimatedFlowerCost}</p>
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
