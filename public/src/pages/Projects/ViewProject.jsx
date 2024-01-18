import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';
import {aggregateFlowerData} from '../../utls/aggregateFlowerData';

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/'

export default function ViewProject() {
    const { id } = useParams();
    const axiosPrivate = useAxiosPrivate();
    const [arrangementData, setArrangementData] = useState(null)
    const [flowerData, setFlowerData] = useState(null)
    const [showFlowerData, setShowFlowerData] = useState([])

    const updateArrangementData = () => {
        const updatedArrangementData = arrangementData?.map((item) => {
          const hasFlowers = flowerData?.some((flower) => flower.arrangementid === item.arrangementid && flower.flowerid != null);
          return { ...item, hasFlowers };
        });
        setArrangementData(updatedArrangementData);
    };
    
    useEffect(() => {
        if (flowerData) {
            setShowFlowerData(aggregateFlowerData(flowerData));
            updateArrangementData();
            }
    }, [flowerData])

    const fetchFlowers = async () => {
        try {
            console.log(id)
            const response = await axiosPrivate.get(ARRANGEMENT_DATA_FETCH + id)
            console.log(response)
            setArrangementData(response?.data?.arrangements)
            setFlowerData(response?.data?.flowers)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchFlowers()
    }, [])

    return (
        <div>
            <Link to='/projects' className="mt-4 text-blue-500 hover:text-blue-700">go back</Link>
            <table>
                <thead>
                    <tr>
                        {['type', 'Description', 'Quantity', 'Flower Budget', 'Assigned budget', 'status'].map((name, index) => (
                            <th key={index} className="border p-2">{name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {arrangementData?.map((item, index) => (
                        <tr key={index} className='bg-gray-200'>
                            <td className=" p-2 text-center">{item?.arrangementtype}</td>
                            <td className=" p-2 text-center">{item?.arrangementdescription}</td>
                            <td className=" p-2 text-center">{item?.arrangementquantity}</td>
                            <td className=" p-2 text-center">{item?.flowerbudget}</td>
                            <td className=" p-2 text-center">{item?.assignedBudget}</td>                            
                            <td className=" p-2 text-center">{item?.hasFlowers ? "Created" : "design needed"}</td>

                        </tr>
                    ))}
                </tbody>
            </table>
            <table>
                <thead>
                    <tr>
                        {['Flower name', 'Total stems', 'Unit price', 'Estimated Cost'].map((name, index) => (
                            <th key={index} className="border p-2">{name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {showFlowerData?.map((item, index) => (
                        <tr key={index} className='bg-gray-200'>
                            <td className=" p-2 text-center">{item?.flowername}</td>
                            <td className=" p-2 text-center">{item?.totalstems}</td>
                            <td className=" p-2 text-center">{item?.unitprice}</td>
                            <td className=" p-2 text-center">{item?.estimatedcost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
