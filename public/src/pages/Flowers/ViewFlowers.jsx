import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { BASE_URL } from '../../api/axios';
import { Link } from 'react-router-dom';

const GET_FLOWERS_URL = '/api/flowers';
const ITEMS_PER_PAGE = 25

const ViewFlowers = () => {
    const [flowerData, setFlowerData] = useState([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosPrivate.get(`${GET_FLOWERS_URL}/${offset}/${searchQuery}`);
                setFlowerData(response?.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [offset, searchQuery]);

    const handleNextClick = () => {
        if (flowerData.length >= ITEMS_PER_PAGE){
            setOffset(offset + 1);
        }
    };

    const handlePrevClick = () => {
        if (offset > 0) {
            setOffset(offset - 1);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        setOffset(0)
    }

    return (
        <div className="container mx-auto my-4">
            <div className="flex justify-between mb-4">
            <Link to="/flowers/create" className="bg-black text-white font-bold py-2 px-4 rounded">Add new flower</Link>
            <div className="flex">
                <div className="mr-2">
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearch} className="border rounded p-2"/>
                </div>
                <button onClick={handlePrevClick} className={`bg-blue-500 text-white font-bold py-2 px-4 rounded mr-2 ${offset <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={offset <= 0}>Prev</button>
                <button onClick={handleNextClick} className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${flowerData.length < ITEMS_PER_PAGE ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={flowerData.length < ITEMS_PER_PAGE}>Next</button>
            </div>
        </div>

            {loading ? (<p>Loading...</p>) : (
                <div className="flex flex-wrap gap-4 background-gray">
                    {flowerData.map((flower) => (
                        <div key={flower.flowerid} className="bg-white rounded-md overflow-hidden shadow-md w-64">
                            <img src={`${BASE_URL}/api/${flower.flowerimage}`} alt={flower.flowername} className="w-full h-32 object-cover"/>
                            <div className="p-4">
                                <h2 className="text-xl font-bold mb-2">{flower.flowername}</h2>
                                <p className="text-gray-600">{flower.flowercolor}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewFlowers;
