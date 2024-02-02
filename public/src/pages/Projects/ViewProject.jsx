import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { aggregateFlowerData } from '../../utls/aggregateFlowerDataProject';
import { BASE_TD_STYLE } from '../../styles';

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/';

export default function ViewProject() {
    const { id } = useParams();
    const axiosPrivate = useAxiosPrivate();
    const [arrangementData, setArrangementData] = useState([]);
    const [flowerData, setFlowerData] = useState([]);
    const [showFlowerData, setShowFlowerData] = useState([]);

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

    useEffect(() => {
        if (flowerData.length > 0) {
            console.log(flowerData)
            const sortedFlowers = aggregateFlowerData(flowerData)
            console.log("SORTEDfLOWERS", sortedFlowers)
            console.log("SORTEDfLOWERS 0", sortedFlowers[0])
            if (sortedFlowers[0]){
                setShowFlowerData(sortedFlowers[0]);
            } else {
                setShowFlowerData([])
            }
            updateArrangementData();
        }
    }, [flowerData]);

    const fetchFlowers = async () => {
        try {
            const response = await axiosPrivate.get(ARRANGEMENT_DATA_FETCH + id);
            console.log(response)
            setArrangementData(response?.data?.arrangements || []);
            setFlowerData(response?.data?.flowers || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchFlowers();
    }, []);

    return (
        <div className="container mx-auto my-8 text-center">
            <div className="mb-4 ">
                <Link to="/projects" className="text-blue-500 hover:text-blue-700">Go back</Link>
                <h2 className="text-2xl font-bold mb-4 text-center">Project Overview</h2>
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
                            <tr key={index} className='bg-gray-300'>
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
                            {showFlowerData?.map((item, index) => (
                                <tr key={index} className='bg-gray-300'>
                                    <td className={BASE_TD_STYLE}>{item?.flowername}</td>
                                    <td className={BASE_TD_STYLE}>{item?.totalstems}</td>
                                    <td className={BASE_TD_STYLE}>{item?.unitprice}</td>
                                    <td className={BASE_TD_STYLE}>{item?.estimatedcost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="w-1/2">
                    {/* Duplicate the flower data table for the second set */}
                    <h2 className="text-lg font-bold mb-4">Flower Data</h2>
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
                                <tr key={index} className='bg-gray-300'>
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
