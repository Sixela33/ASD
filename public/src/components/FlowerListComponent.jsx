import React, { useEffect, useRef, useState, useCallback } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useAlert from '../hooks/useAlert'
import { useInView } from 'react-intersection-observer'
import { debounce } from "lodash"
import MultipleFlowerColorSelector from './MultipleFlowerColorSelector.jsx'

const GET_FLOWERS_URL = '/api/flowers/many/'
const GET_FLOWER_COLORS_URL = '/api/flowers/colors'

export default function FlowerListComponent({onFlowerClick, styles, selectedFlowerID, refresh, showToggleIncomplete, onDrag}) {
    if(!onFlowerClick) onFlowerClick = () => {}
    if(!onDrag) onDrag = () => {}
    if(refresh == undefined) refresh = false

    const axiosPrivate = useAxiosPrivate();
    const { setMessage } = useAlert();
    const [ref, inView] = useInView({});

    const offset = useRef(0);

    const flowersLeft = useRef(true)
    const firstLoad = useRef(false)

    const [flowerData, setFlowerData] = useState([]);
    const [flowerColors, setFlowerColors] = useState([])
    const [searchQuery, setSearchQuery] = useState('');

    const [showIncomplete, setShowincomplete] = useState(false)
    const [selectedColors, setSelectedColors] = useState([])

    const fetchFlowerColors = async () => {
        try {
            let flowerColors = axiosPrivate.get(GET_FLOWER_COLORS_URL)
            flowerColors = await flowerColors 
            setFlowerColors(flowerColors.data)
                

        } catch (error) {
            setMessage(error.response?.data, true);
            console.error('Error fetching colors:', error);
        }
    }

    const fetchFlowers = async (searchQ, colorFilter, showIncomplete) => {
        try {            
            colorFilter = colorFilter.map(item => item.colorid)
            showIncomplete = showIncomplete || false

            let response = await axiosPrivate.get(GET_FLOWERS_URL + offset.current + '/' + searchQ, {
                params: {
                    filterByColor: colorFilter,
                    showIncomplete: showIncomplete
                }
            })
            
            offset.current += 1
            if(response?.data.length == 0) {
                flowersLeft.current = false
                return
            }

            setFlowerData(prevData => [...prevData, ...response.data])
        } catch (error) {
            setMessage(error.response?.data, true);
            console.error('Error fetching data:', error);
        } finally {
            firstLoad.current=true
        }
    }

    const debounced = useCallback(debounce(fetchFlowers, 300), []);
    const debouncedInitial = useCallback(debounce(fetchFlowers, 100), []);

    useEffect(() => {
        debouncedInitial(searchQuery, selectedColors, showIncomplete)
        fetchFlowerColors()
    }, []);

    useEffect(() => {
        if (inView && firstLoad.current && flowersLeft.current) {
            debounced(searchQuery, selectedColors, showIncomplete)
        }
    }, [inView]);

    useEffect(() => {
        if (firstLoad.current) {
            setFlowerData([])
            offset.current = 0
            flowersLeft.current = true
            debounced(searchQuery, selectedColors, showIncomplete)
        }
    }, [searchQuery, selectedColors, showIncomplete, refresh]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }


    return (
        <div className="mx-auto my-4 px-10 w-full">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-evenly`}>
                <div className="flex flex-col w-full md:w-auto">
                    <label className='mb-1 text-sm md:text-base'>Search by name: </label>
                    <input className='w-full px-3 py-2' type="text" placeholder="Search..." value={searchQuery} onChange={handleSearch}/>
                </div>
                <div className={`mb-3 mx-5 flex justify-start items-center ${!showToggleIncomplete && 'lg:col-span-2'}`}>
                    <label >Search by color: </label>
                    <MultipleFlowerColorSelector
                        options={flowerColors}
                        selectedColors={selectedColors} 
                        setSelectedColors={setSelectedColors}
                        doubleColunms={!showToggleIncomplete}
                    />
                </div>
                {showToggleIncomplete && <div className='mb-3 flex justify-start items-center'>
                    <label>Show incomplete flowers</label>
                    <input type='checkbox' onClick={() => setShowincomplete(!showIncomplete)}></input>
                </div>}
            </div>

            <div className="flex flex-wrap gap-4 overflow-auto w-full justify-center" style={styles}>
                {flowerData.map((flower, index) => (
                    <div 
                    key={index} 
                    className={`rounded-md overflow-hidden shadow-md w-60 hover:cursor-pointer ${selectedFlowerID == flower.flowerid ?" bg-gray-400":"bg-white"}`} 
                    onClick={() => onFlowerClick(flower)}
                    draggable
                    onDragStart={(e) => onDrag(e, flower)}>
                        <img src={`${flower.flowerimage}`} alt={flower.flowername} loading="lazy" className="w-full object-cover h-32"/>
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{flower.flowername}</h2>
                            <p className="text-gray-600">{flower.flowercolors[0] || ""}</p>
                        </div>
                    </div>
                ))}
                {flowersLeft.current && <div ref={ref}><></></div>}
            </div>
        </div>

    )
}
