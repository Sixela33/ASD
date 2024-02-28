import React, { useState, useEffect, useRef } from 'react'
import QuerySearchableDropdown from '../Dropdowns/QuerySearchableDropdown';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useInView } from 'react-intersection-observer';
import PopupBase from '../PopupBase';
import CreateNewFlowerPopup from '../CreateNewFlowerPopup';

const GET_FLOWERS_URL = '/api/flowers/many/';

export default function InvoiceAddFlowerToProjectPopup({showPopup, submitFunction, closePopup}) {
    const [showPopup2, setShowPopup2] = useState(false)
    const [flowerData, setFlowerData] = useState([]);
    const [selectedFlower, setSelectedFlower] = useState('')

    const page = useRef(0)
    const isLoading = useRef(false)    
    const dataLeft = useRef(true)    
    const [searchQuery, setSearchQuery] = useState('');
    
    const [ref, inView] = useInView({});

    const axiosPrivate = useAxiosPrivate();
    const { setMessage } = useAlert()

    const fetchFlowers = async () => {

        if (isLoading.current || !dataLeft.current) {
            return;
        }
        
        try {
            isLoading.current = true
            const response = await axiosPrivate.get(`${GET_FLOWERS_URL}${page.current}/${searchQuery}`)
            
            page.current = page.current + 1
            if (response.data?.length === 0) {
                dataLeft.current = false;
                return;
            }

            setFlowerData(prevFlowers => [...prevFlowers, ...response.data]);

        } catch (error) {
            setMessage(error.response?.data?.message, true);
            console.error('Error fetching data:', error);
        } finally {
            isLoading.current = false
        }
    }

    useEffect(() => {
        if (inView) {
            fetchFlowers();
        }
    }, [inView]);

    useEffect(() => {
        setFlowerData([])
        dataLeft.current = true
        page.current = 0
        fetchFlowers()
    }, [searchQuery])

    const submitSelection = (e) => {
        e.preventDefault()
        if (!selectedFlower) {
            return
        }
        submitFunction(selectedFlower)
        setSelectedFlower('')
        closePopup()
    }

    const exitPopup = () => {
        setSelectedFlower('')
        closePopup()
    }

    return (
        <PopupBase showPopup={showPopup}>
            <CreateNewFlowerPopup showPopup={showPopup2} closePopup={() => setShowPopup2(false)}/>
            <h3 className="text-2xl font-semibold mb-4">Select flower</h3>
            <QuerySearchableDropdown 
                options={flowerData} 
                label='flowername' 
                selectedVal={selectedFlower} 
                handleChange={newSelection => setSelectedFlower(newSelection)} 
                placeholderText='Select new flower' 
                InViewRef={ref} 
                query={searchQuery}
                setQuery={setSearchQuery}/>
            <button onClick={() => {setShowPopup2(true)}} className="text-blue-500 hover:text-blue-700">Add new flower</button>
            <div className="flex justify-between mt-4">
                <button onClick={exitPopup} className="bg-gray-400 text-white px-4 py-2 rounded focus:outline-none">close</button>
                <button className="bg-black text-white px-4 py-2 rounded focus:outline-none" onClick={submitSelection}>add flower</button>
            </div>
        </PopupBase>

  
    );
}
