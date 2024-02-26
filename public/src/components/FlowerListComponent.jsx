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

    const flowersLeft = useRef(true)
    const firstLoad = useRef(false)
    const [flowerData, setFlowerData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFlowers = async (searchQ) => {
        try {
            const response = await axiosPrivate.get(GET_FLOWERS_URL + offset.current + '/' + searchQ);
            offset.current += 1
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

    const debounced = useCallback(debounce(fetchFlowers, 300), []);
    const debouncedInitial = useCallback(debounce(fetchFlowers, 100), []);

    useEffect(() => {
        debouncedInitial(searchQuery)
    }, []);

    useEffect(() => {
        if (inView && firstLoad.current && flowersLeft.current) {
            debounced(searchQuery)
        }
    }, [inView]);

    useEffect(() => {
        if (firstLoad.current) {
            setFlowerData([])
            offset.current = 0
            flowersLeft.current = true
            debounced(searchQuery)
        }
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    return (
        <div className="mx-auto my-4 px-10">
            <div className="mb-3">
                <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearch} className="border rounded p-2"/>
            </div>
            <div className="flex flex-wrap items-center gap-4 background-gray overflow-y-scroll w-full text-center items-center" style={styles}>

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
