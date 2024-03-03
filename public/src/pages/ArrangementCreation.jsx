import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAlert from '../hooks/useAlert';
import FlowerListComponent from '../components/FlowerListComponent';
import { useNavigate, useLocation } from 'react-router-dom';

const FETCH_ARRANGEMENT_DATA_URL = '/api/arrangements/creation/';
const SUBMIT_ARRANGEMENT_URL = '/api/arrangements/creation/'

export default function ArrangementCreation() {
    const { id } = useParams();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    const { setMessage } = useAlert();
    const navigateTo = useNavigate();

    const [arrangementData, setArrangementData] = useState(null);
    const [selectedFlowers, setSelectedFlowers] = useState([]);
    const [actualSelectedFlower, setActualSelectedFlower] = useState(null);
    const [quantityToAdd, setQuantityToAdd] = useState('');
    const quantityInputRef = useRef(null);

    const fetchData = async () => {
        try {
            const response = await axiosPrivate.get(FETCH_ARRANGEMENT_DATA_URL + id);
            const { arrangementData, arrangementFlowers } = response?.data;
            setArrangementData(arrangementData[0]);
            setSelectedFlowers(arrangementFlowers);
        } catch (error) {
            setMessage(error.response?.data?.message, true);
            console.error('Error fetching data:', error);
        }
    };

    const submitArrangement = async () => {
        try {
            if (selectedFlowers.length == 0){
                setMessage("No flowers where selected", true)
                return 
            }
            const submitData = {
                arrangementid: arrangementData.arrangementid,
                flowers: selectedFlowers.map(flower => ({
                    flowerID: flower.flowerid,
                    quantity: flower.quantity
                }))
            };
            
            const response = await axiosPrivate.post(SUBMIT_ARRANGEMENT_URL, JSON.stringify(submitData))
            setMessage('Arrangemente created succesfully', false)
            navigateTo('/projects/' + location.state.projectID)
        } catch (error) {
            setMessage(error.response?.data?.message, true);
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const selectFlower = (flower) => {
        setActualSelectedFlower(flower);
        // Enfocar automáticamente el input de cantidad al seleccionar una flor
        setQuantityToAdd('')
        quantityInputRef.current.focus();
    };

    const addFlower = () => {
        if (actualSelectedFlower) {

            const index = selectedFlowers.findIndex((flower) => flower.flowerid == actualSelectedFlower.flowerid)
            
            if (index != -1) {
                setMessage("Flower Already in arrangement")
                return
            }
         
            const newSelected = [...selectedFlowers];
            const newObject = { ...actualSelectedFlower, quantity: quantityToAdd };
            newSelected.push(newObject);
            setSelectedFlowers(newSelected);
            setQuantityToAdd('');


        }
    };

    const removeFlower = (index) => {
        const newSelectedFlowers = [...selectedFlowers]
        newSelectedFlowers.splice(index, 1)
        setSelectedFlowers(newSelectedFlowers)
    }

    const changeFlowerAmm = (e, index) => {
        const newSelectedFlowers = [...selectedFlowers]
        newSelectedFlowers[index].quantity = e.target.value
        setSelectedFlowers(newSelectedFlowers)
        
        if(e.target.value <= 0) {
            removeFlower(index)
        }
    }

    const sum = selectedFlowers.reduce((accumulator, flower) => accumulator + ((flower.unitprice || 0) * flower.quantity), 0)

    return (
        <>
            {arrangementData && (
                <div className="mx-auto my-8 text-center">
                    <div className="mb-4 ">
                        <button onClick={() => navigateTo(-1)} className="text-blue-500 hover:text-blue-700">go back</button>
                        <h2 className="text-2xl font-bold mb-4 text-center">Create Arrangement</h2>
                    </div>
                    <p>Arrangement Description: {arrangementData.arrangementdescription}</p>
                    <p>Arrangement type: {arrangementData.typename}</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-10 font-bold py-4">
                        <div className="md:col-span-2 bg-gray-300 rounded shadow">
                            <FlowerListComponent
                                onFlowerClick={selectFlower}
                                styles={{ maxHeight: '60vh' }}
                                selectedFlowerID={actualSelectedFlower?.flowerid}
                            />
                        </div>
                        <div className="md:col-span-1 rounded shadow p-4 flex flex-col justify-center items-center">
                            <div>
                                <p>unitPrice: {actualSelectedFlower?.unitprice ? actualSelectedFlower?.unitprice : 'N/A'}</p>
                                <input ref={quantityInputRef} value={quantityToAdd} onChange={(e) => { setQuantityToAdd(e.target.value) }} type="number" placeholder="Add" className="border border-black rounded p-2 mr-2 text-center w-20" />
                                <button onClick={addFlower} disabled={quantityToAdd <= 0} className={`bg-gray-300 px-4 py-2 mr-2 my-1 rounded ${quantityToAdd <= 0 && 'cursor-not-allowed opacity-50'}`} >
                                    ADD
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-1 flex flex-col justify-center items-center">
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr>
                                        {["Flower Name", "Flower Quantity", "Last recorded price", "remove"].map((name, index) => (
                                            <th key={index} className="border p-2">
                                                {name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='overflow-y-scroll' style={{ height: '30vh' }}>
                                    {selectedFlowers.map((flower, index) => (
                                        <tr key={index} className="bg-gray-300" onClick={() => { }}>
                                            <td className="border-b p-2 text-center">{flower.flowername}</td>
                                            <td className="border-b p-2 text-center">
                                                <input type='number' className='w-full' value={flower.quantity} onChange={(e) => changeFlowerAmm(e, index)}/>
                                            </td>
                                            <td className="border-b p-2 text-center">${flower.unitprice || 'N/A'}</td>
                                            <td className="border-b p-2 text-center"><button onClick={() => removeFlower(index)}>remove</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="mt-4">Flower Budget: ${parseFloat(arrangementData.clientcost * (1 - arrangementData.profitmargin)).toFixed(2)}</p>
                            <p className="mt-4">Spent Budget: ${sum}</p>
                            <button className='bg-black text-white w-full p-2 rounded' onClick={submitArrangement}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
