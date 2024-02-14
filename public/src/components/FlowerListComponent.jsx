import React, { useEffect, useRef, useState, useCallback } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useAlert from '../hooks/useAlert'
import { useInView } from 'react-intersection-observer'
import { BASE_URL } from '../api/axios'
import { debounce } from "lodash";

const GET_FLOWERS_URL = '/api/flowers/'

export default function FlowerListComponent({onFlowerClick, styles, selectedFlowerID}) {
    if(!onFlowerClick) onFlowerClick = () => {}
    const axiosPrivate = useAxiosPrivate();
    const { setMessage } = useAlert();
    const [ref, inView] = useInView({});

    const offset = useRef(0);
    const query = useRef('');

    const flowersLeft = useRef(true)
    const firstLoad = useRef(false)
    const [flowerData, setFlowerData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFlowers = async () => {
        try {
            const response = await axiosPrivate.get(GET_FLOWERS_URL + offset.current + '/' + query.current);
            console.log(response.data)
            if(response?.data.length == 0) {
                flowersLeft.current = false
                return
            }
            setFlowerData(prevData => [...prevData, ...response.data]);
        } catch (error) {
            setMessage(error.response?.data?.message, true);
            console.error('Error fetching data:', error);
        } finally {
            firstLoad.current=true
        }
    }

    const debounced = useCallback(debounce(fetchFlowers, 500), []);

    useEffect(() => {
        console.log("aca")
        debounced()
        offset.current += 1;
    }, []);

    useEffect(() => {
        if (inView && firstLoad.current && flowersLeft.current) {
            console.log('asdf')
            debounced()
            offset.current += 1;
        }
    }, [inView]);

    useEffect(() => {
        setFlowerData([])
        offset.current = 0
        flowersLeft.current = true
        debounced()
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        query.current = e.target.value
    }

    return (
        <div className="mx-auto my-4">
            <div className="mb-3">
                <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearch} className="border rounded p-2"/>
            </div>
            <div className="flex flex-wrap items-center gap-4 background-gray overflow-y-scroll w-full text-center" style={styles}>

                {flowerData.map((flower, index) => (
                    <div key={index} className={`rounded-md overflow-hidden shadow-md w-60 hover:cursor-pointer ${selectedFlowerID == flower.flowerid ?" bg-gray-400":"bg-white"}`} onClick={() => onFlowerClick(flower)}>
                        <img src={`${BASE_URL}/api/${flower.flowerimage}`} alt={flower.flowername} className="w-full object-cover h-32"/>
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{flower.flowername}</h2>
                            <p className="text-gray-600">{flower.flowercolor}</p>
                        </div>
                    </div>
                ))}
                {flowersLeft.current && <div ref={ref}>-</div>}
            </div>
        </div>

    )
}
