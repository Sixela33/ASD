import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import ChangeImagePopup from './Popups/ChangeImagePopup';
import { BASE_URL } from '../../api/axios';
import useAlert from '../../hooks/useAlert';

const FETCH_FLOWER_DATA_URL = '/api/flowers/single/';
const REMOVE_FLOWER_URL = '/api/flowers/single/';
const EDIT_FLOWER_URL = '/api/flowers/edit';

export default function SingleFlowerPage() {
    const axiosPrivate = useAxiosPrivate();
    const axiosPrivateImage = useAxiosPrivateImage()
    const { id } = useParams();
    const {setMessage} = useAlert()


    const [baseFlowerData, setBaseFlowerData] = useState({});
    const [flowerPrices, setFlowerPrices] = useState([]);
    const [newFlowerData, setNewFlowerData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [showNewFlowerPopup, setShowNewFlowerPopup] = useState(false);
    const [previewImage, setPreviewImage] = useState(null)
    
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

    const setNewImage = (file) => {
        setNewFlowerData(prev => ({ ...prev, flowerimage: file }));
        console.log(file)
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const editFlowerData = (label, value) => {
        setNewFlowerData((prevFormState) => ({...prevFormState,[label]: value,}))
    }

    const saveChanges = async () => {
        console.log("newFlowerData", newFlowerData)
        try {
            const formDataToSend = new FormData();
            console.log("baseFlowerData.flowerimage", baseFlowerData.flowerimage)
            formDataToSend.append('name', newFlowerData.flowername);
            formDataToSend.append('color', newFlowerData.flowercolor);
            formDataToSend.append('flower', newFlowerData.flowerimage); 
            formDataToSend.append('prevFlowerPath', baseFlowerData.flowerimage); 
            formDataToSend.append('id', newFlowerData.flowerid); 
    
            const response = await axiosPrivateImage.patch(EDIT_FLOWER_URL, formDataToSend);
            console.log(response)
            setMessage("Flower Added succesfully", false)

        } catch (error) {
            setMessage(error.response?.data, true)
            console.log(error);
        }
    }

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    return (
        <div className="h-[80vh] flex flex-col justify-center items-center">
            <ConfirmationPopup showPopup={showConfirmationPopup} closePopup={() => setShowConfirmationPopup(false)} confirm={deleteFlower}>
                Are you sure you want to remove {baseFlowerData.flowername} from the database?
            </ConfirmationPopup>
            <ChangeImagePopup showPopup={showNewFlowerPopup} closePopup={() => setShowNewFlowerPopup(false)} setNewImage={setNewImage}></ChangeImagePopup>

            <div className="m-10">
                <Link to="/flowers" className="text-blue-500 mb-4 ml-4">Go Back</Link>
            </div>

            <div className="container mx-auto flex">
                <div className="w-1/2">
                    <div className="flex flex-col items-center">
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="w-64 h-64 object-cover rounded-lg shadow-lg" />
                        ): newFlowerData.flowerimage && (
                            <img src={`${BASE_URL}/api/${newFlowerData.flowerimage}`} alt="Preview" className="w-64 h-64 object-cover rounded-lg shadow-lg" />
                        )}
                        {}                        
                        <button className='bg-gray-500 text-white font-bold py-2 px-4 rounded mt-4' onClick={() => setShowNewFlowerPopup(true)}>Change image</button>
                        <div className="p-4 text-center">
                            <div className="mb-4">
                                <label>Name: </label>
                                <input className="rounded-lg p-2" value={newFlowerData.flowername} onChange={(e) => editFlowerData('flowername', e.target.value)} />
                            </div>
                            <div>
                                <label>Color: </label>
                                <input className="rounded-lg p-2" value={newFlowerData.flowercolor} onChange={(e) => editFlowerData('flowercolor', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className='text-center'>
                        <button className='bg-gray-500 text-white font-bold py-2 px-4 rounded mx-2' onClick={() => setShowConfirmationPopup(true)}>Remove</button>
                        <button className='bg-black text-white font-bold py-2 px-4 rounded mx-2' onClick={saveChanges}>Save</button>
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
                            <Line type="monotone" dataKey="unitprice" stroke="#1270ce" strokeWidth={3} />
                        </LineChart>
                    </div>
                </div>
            </div>
        </div>
    );
}
