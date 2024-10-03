import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAlert from '../hooks/useAlert';
import FlowerListComponent from '../components/FlowerListComponent';
import { useNavigate, useLocation } from 'react-router-dom';
import { toCurrency } from '../utls/toCurrency';
import { toInteger } from 'lodash';
import NumberInputWithNoScroll from '../components/NumberInputWithNoScroll';
import ConfirmationPopup from '../components/Popups/ConfirmationPopup';

const FETCH_ARRANGEMENT_DATA_URL = '/api/arrangements/creation/';
const SUBMIT_ARRANGEMENT_URL = '/api/arrangements/creation/'
const DELETE_ARRANGEMENT_URL = 'api/arrangements/'

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
            let tempFlowers = []
            for(let flower of selectedFlowers) {
                if (flower.quantity > 0) {
                    tempFlowers.push({
                        flowerID: flower.flowerid,
                        quantity: toInteger(flower.quantity) || ''
                    })
                }
            }

            const submitData = {
                arrangementid: arrangementData.arrangementid,
                flowers: tempFlowers
            };
            
            await axiosPrivate.post(SUBMIT_ARRANGEMENT_URL, JSON.stringify(submitData))
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
        quantityInputRef.current.focus();
    };

    const addFlowerDrop = (flowerToAdd, quantity) => {
        if (flowerToAdd && quantity>=0) {

            const index = selectedFlowers.findIndex((flower) => flower.flowerid == flowerToAdd.flowerid)
            const newSelected = [...selectedFlowers];
            
            if (index == -1) {
                const newObject = { ...flowerToAdd, quantity: toInteger(quantity) };
                newSelected.push(newObject);
            } else {
                newSelected[index].quantity = toInteger(newSelected[index].quantity)
                newSelected[index].quantity += toInteger(quantity)
            }

            setSelectedFlowers(newSelected);
        }
    }

    const removeFlower = (index) => {
        const newSelectedFlowers = [...selectedFlowers]
        newSelectedFlowers.splice(index, 1)
        setSelectedFlowers(newSelectedFlowers)
    }

    const changeFlowerAmm = (e, index) => {
        const newSelectedFlowers = [...selectedFlowers]
        newSelectedFlowers[index].quantity = e.target.value
        setSelectedFlowers(newSelectedFlowers)
        
        if(e.target.value < 0) {
            removeFlower(index)
        }
    }

    const sum = selectedFlowers.reduce((accumulator, flower) => accumulator + ((flower.unitprice || 0) * flower.quantity), 0)

    const handleOnDrag = (e, flower) => {
        selectFlower(flower)
        e.dataTransfer.setData('flower', JSON.stringify(flower))
    }

    const handleOnDrop = (e) => {
        let flower = e.dataTransfer.getData("flower")
        flower = JSON.parse(flower)
        addFlowerDrop(flower, quantityToAdd)
    }

    const handleArrangementDelete = async () => {
        try {
            await axiosPrivate.delete(DELETE_ARRANGEMENT_URL + id)
            setShowDeletePopup(false)
            setMessage("Arrangement deleted successfully", false)
            navigateTo('/projects')
        } catch (error) {
            setMessage(error.response?.data, true)
    
        }
    }

    const [showDeletePopup, setShowDeletePopup] = useState(false)

    return (
        <>
            {arrangementData && (
                <div className="mx-auto my-8 text-center page p-6">
                     <ConfirmationPopup
                        showPopup={showDeletePopup}
                        closePopup={() => setShowDeletePopup(false)}
                        confirm={handleArrangementDelete}
                    >
                        <p>Are you sure you want to delete this arrangement?</p>

                    </ConfirmationPopup>
                    <div className="grid grid-cols-3 mb-4">
                        <button onClick={() => navigateTo(-1)} className='go-back-button col-span-1'>Go Back</button>
                        <h2 className='col-span-1'>Create Arrangement</h2>
                    </div>
                    <div className='text-left flex flex-row justify-evenly my-5'>
                        <p><span className='font-bold'>Arrangement Description: </span> {arrangementData.arrangementdescription}</p>
                        <p><span className='font-bold'>Arrangement type: </span>{arrangementData.typename}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-10 gap-4  font-bold py-4">
                        <div className="md:col-span-6 bg-gray-300">
                            <FlowerListComponent
                                onFlowerClick={selectFlower}
                                styles={{ maxHeight: '50vh' }}
                                selectedFlowerID={actualSelectedFlower?.flowerid}
                                onDrag={handleOnDrag}
                            />
                        </div>
          
                        <div className='mr-10 md:col-span-4'>
                            <div className='table-container h-[50vh] ' onDrop={handleOnDrop} onDragOver={(e) => e.preventDefault()}>
                                <table className="w-full" >
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
                                                    <NumberInputWithNoScroll type='number' className='w-full' value={flower.quantity} onChange={(e) => changeFlowerAmm(e, index)}/>
                                                </td>
                                                <td >{toCurrency(flower.unitprice || 0)}</td>
                                                <td ><button className='go-back-button' onClick={() => removeFlower(index)}>remove</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className='flex flex-row items-center justify-evenly'>
                                <div>
                                    <p>unitPrice: {actualSelectedFlower ? toCurrency(actualSelectedFlower?.unitprice) : 'N/A'}</p>
                                    <NumberInputWithNoScroll ref={quantityInputRef} value={quantityToAdd} onChange={(e) => { setQuantityToAdd(e.target.value) }} type="number" placeholder="Add" className="w-20" min='0' />
                                    <button onClick={() => addFlowerDrop(actualSelectedFlower, quantityToAdd)} className='buton-secondary'>Add</button>
                                </div>
                                <div>
                                    <p className="mt-4">Flower Budget: {toCurrency(arrangementData.clientcost * arrangementData.profitmargin)}</p>
                                    <p className="mt-4">Spent Budget: <span className={(arrangementData.clientcost * arrangementData.profitmargin < sum) ? 'text-red-500' : ''}>{toCurrency(sum)}</span></p>
                                    <button className='buton-main' onClick={submitArrangement}>Save</button>
                                    <button className='buton-main' onClick={() => setShowDeletePopup(true)}>Remove</button>
                                </div>
                                <div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
