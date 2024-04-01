import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';
import useAlert from '../../hooks/useAlert';
import NewFlowerForm from '../../components/NewFlowerForm';

const FETCH_FLOWER_DATA_URL = '/api/flowers/single/';
const REMOVE_FLOWER_URL = '/api/flowers/single/';

export default function SingleFlowerPage() {
    const axiosPrivate = useAxiosPrivate();
    const { id } = useParams();
    const {setMessage} = useAlert()


    const [baseFlowerData, setBaseFlowerData] = useState({});
    const [flowerPrices, setFlowerPrices] = useState([]);
    const [newFlowerData, setNewFlowerData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [showEditFlowerPopup, setShowEditFlowerPopup] = useState(false)
    
    const fetchData = async () => {
        try {
            const response = await axiosPrivate.get(FETCH_FLOWER_DATA_URL + id);
            setBaseFlowerData(response?.data.flowerData[0]);
            setNewFlowerData(response?.data.flowerData[0]);
            setFlowerPrices(response?.data.flowerPrices);
        } catch (error) {
            setMessage(error.response?.data, true)
        } finally {
            setLoading(false);
        }
    };

    const deleteFlower = async () => {
        try {
            console.log("deleted");
            //await axiosPrivate.delete(REMOVE_FLOWER_URL + id)
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-8 ">
            <ConfirmationPopup showPopup={showConfirmationPopup} closePopup={() => setShowConfirmationPopup(false)} confirm={deleteFlower}>
                Are you sure you want to remove {baseFlowerData.flowername} from the database?
            </ConfirmationPopup>
            <NewFlowerForm
                showPopup={showEditFlowerPopup}
                cancelButton={() => setShowEditFlowerPopup(false)}
                flowerToEdit={baseFlowerData}
                refreshData={fetchData}
                />

            <div className="grid grid-cols-3 w-full text-center my-[3vh]">
                <Link to="/flowers" className='go-back-button col-span-1 '>Go Back</Link>
            </div>

            <div className="container mx-auto flex">
                <div className="w-1/2">
                    <div className="flex flex-col items-center">
                    <img src={`${newFlowerData.flowerimage}`} alt="Preview" loading='lazy' className="w-64 h-64 object-cover rounded-lg shadow-lg" />
                    <div className="p-4 text-center">
                        <div className="mb-4">
                            <p>Name: {newFlowerData.flowername}</p>
                        </div>
                        <div>
                            <p>Color: {newFlowerData.flowercolor}</p>
                        </div>
                    </div>
                    </div>
                    <div className='buttons-holder'>
                        <button className='buton-secondary' onClick={() => setShowConfirmationPopup(true)}>Remove</button>
                        <button className='buton-main' onClick={() => setShowEditFlowerPopup(true)}>Edit</button>

                    </div>
                </div>
                <div className="w-1/2">
                    <div className="mt-8">
                        <LineChart width={600} height={300} data={flowerPrices} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="createdat" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="unitprice" stroke="#1270ce" strokeWidth={3} isAnimationActive={false} />
                        </LineChart>
                    </div>
                </div>
            </div>
        </div>
    );
}
