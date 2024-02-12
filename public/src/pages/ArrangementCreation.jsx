import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAlert from '../hooks/useAlert';
import FlowerListComponent from '../components/FlowerListComponent';

const FETCH_ARRANGEMENT_DATA_URL = '/api/arrangements/creation/'

export default function ArrangementCreation() {
    const { id } = useParams();
    const stateArrangementData = location?.state
    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const [arrangementData, setArrangementData] = useState([])
    const [selectedFlowers, setSelectedFlowers] = useState([])

    const fetchData = async () => {
        try {
            const response = await axiosPrivate.get(FETCH_ARRANGEMENT_DATA_URL + id)
            const {arrangementData, arrangementFlowers} = response?.data
            
            setArrangementData(arrangementData[0])
            setSelectedFlowers(arrangementFlowers)

            console.log(response)
        } catch (error) {
            setMessage(error.response?.data?.message, true);
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const selectFlower = (flower) => {
        console.log(flower)
    }

    return (
        <>
        {arrangementData &&
            <div className=" mx-auto my-8 text-center">
                    <div className="mb-4 ">
                        <h2 className="text-2xl font-bold mb-4 text-center"></h2>
                    </div>

                    <div className="grid grid-col md:grid-cols-2 ml-10 font-bold">
                        <div className='grid-row'>
                            <p>Arrangement Description: {arrangementData.arrangementdescription}</p>
                            <p>Arrangement type: {arrangementData.typename}</p>
                        </div>
                        <div className='grid-row'>
                            <p>flowerbudget: {arrangementData.flowerbudget}</p>
                        </div>
                        <div className='grid-row bg-gray-300 rounded shadow'>
                            <FlowerListComponent 
                            onFlowerClick={selectFlower}
                            styles={{ maxHeight: '70vh' }}/>
                        </div>
                </div>
            </div>
            }
        </>
    )
}
