import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAlert from '../hooks/useAlert';
import FlowerListComponent from '../components/FlowerListComponent';
import { useNavigate, useLocation } from 'react-router-dom';
import { toCurrency } from '../utls/toCurrency';

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
            setMessage(error.response?.data, true);
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
            setMessage(error.response?.data, true);
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
                    <div className="grid grid-cols-3 mb-4">
                        <button onClick={() => navigateTo(-1)} className='go-back-button col-span-1'>Go Back</button>
                        <h2 className='col-span-1'>Create Arrangement</h2>
                    </div>
                    <div className='text-left mx-[20vw]'>
                        <p><span className='font-bold'>Arrangement Description: </span> {arrangementData.arrangementdescription}</p>
                        <p><span className='font-bold'>Arrangement type: </span>{arrangementData.typename}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-10 gap-4 ml-10 font-bold py-4">
                        <div className="md:col-span-5 bg-gray-300 rounded shadow px-auto">
                            <FlowerListComponent
                                onFlowerClick={selectFlower}
                                styles={{ maxHeight: '50vh' }}
                                selectedFlowerID={actualSelectedFlower?.flowerid}
                            />
                        </div>
                        <div className="md:col-span-2 rounded shadow flex flex-col justify-center items-center">
                            <div>
                                <p>unitPrice: {actualSelectedFlower?.unitprice ? actualSelectedFlower?.unitprice : 'N/A'}</p>
                                <input ref={quantityInputRef} value={quantityToAdd} onChange={(e) => { setQuantityToAdd(e.target.value) }} type="number" placeholder="Add" className="w-20" min='0' />
                                <button onClick={addFlower} disabled={quantityToAdd <= 0} className={`buton-secondary ${quantityToAdd <= 0 && 'cursor-not-allowed opacity-50'}`} >
                                    ADD
                                </button>
                            </div>
                        </div>
                        <div className='mr-10 md:col-span-3'>
                            <div className='table-container h-[50vh] '>
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            {["Flower Name", "Flower Quantity", "Last recorded price", "remove"].map((name, index) => (
                                                <th key={index} >
                                                    {name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedFlowers.map((flower, index) => (
                                            <tr key={index}  onClick={() => { }}>
                                                <td >{flower.flowername}</td>
                                                <td >
                                                    <input type='number' className='w-full' value={flower.quantity} onChange={(e) => changeFlowerAmm(e, index)}/>
                                                </td>
                                                <td >${flower.unitprice || 'N/A'}</td>
                                                <td ><button className='go-back-button' onClick={() => removeFlower(index)}>remove</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">Flower Budget: ${toCurrency(arrangementData.clientcost * (1 - arrangementData.profitmargin))}</p>
                            <p className="mt-4">Spent Budget: <span className={(arrangementData.clientcost * (1 - arrangementData.profitmargin) < sum) ? 'text-red-500' : ''}>${sum}</span></p>
                            <button className='buton-main' onClick={submitArrangement}>Save</button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
