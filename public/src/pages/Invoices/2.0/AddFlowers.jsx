import React, { useState, useEffect } from 'react'
import InvoiceAddFlowerToProjectPopup from '../../../components/InvoiceCreation/InvoiceAddFlowerToProjectPopup'
import NumberInputWithNoScroll from '../../../components/NumberInputWithNoScroll'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import useAlert from '../../../hooks/useAlert'

const POST_FLOWERS_URL = "/api/invoices/linkFlowers"

export default function AddFlowers({ invoiceID }) {
    const [invoiceFlowers, setInvoiceFlowers] = useState([])
    const [addFlowerPopup, setAddFlowerPopup] = useState(false)

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleAddFlower = (flower) => {
        const newFlower = { ...flower, numstems: 0, unitprice: 0 }
        setInvoiceFlowers(prev => [...prev, newFlower])
        setAddFlowerPopup(false)
    }

    const modifyFlowerData = (e, flowerIndex) => {
        const { name, value } = e.target
        const updatedFlowers = [...invoiceFlowers]
        updatedFlowers[flowerIndex] = {
            ...updatedFlowers[flowerIndex],
            [name]: parseFloat(value) || 0
        }
        setInvoiceFlowers(updatedFlowers)
    }

    const handleSaveFlowers = async () => {
        try {
            console.log("invoiceID", invoiceID)
            const tempInvoiceFlowers = invoiceFlowers.filter(flower => flower.numstems > 0).map((flower, index) => ({
                flowerid: flower.flowerid,
                numstems: flower.numstems, 
                unitprice: flower.unitprice,
                order: index
            }))

            if (tempInvoiceFlowers.length === 0) {
                setMessage('Please add at least one flower with stems')
                return
            }

            console.log(tempInvoiceFlowers)
            await axiosPrivate.post(POST_FLOWERS_URL, { invoiceID: invoiceID, flowers: tempInvoiceFlowers })
            setMessage('Flowers saved successfully')
        } catch (error) {
            console.error('Error saving flowers:', error)
            setMessage('Failed to save flowers')
        }
    }

    const removeFlower = (index) => {
        setInvoiceFlowers(prev => prev.filter((_, i) => i !== index))
    }

    const calculateTotal = () => {
        return invoiceFlowers.reduce((total, flower) => total + (flower.numstems * flower.unitprice), 0).toFixed(2)
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <InvoiceAddFlowerToProjectPopup 
                showPopup={addFlowerPopup} 
                submitFunction={handleAddFlower} 
                closePopup={() => setAddFlowerPopup(false)} 
            />
            <h2 className='text-2xl font-bold mb-6'>Add Flowers</h2>
            <div className='overflow-y-auto'>

            <table className="w-full mb-4">
                <thead>
                    <tr>
                        <th>Flower Name</th>
                        <th>Stems Bought</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {invoiceFlowers.map((flower, index) => (
                        <tr key={index}>
                            <td>{flower?.flowername}</td>
                            <td>
                                <NumberInputWithNoScroll
                                    className='w-full no-spinner' 
                                    name='numstems' 
                                    value={flower.numstems} 
                                    onChange={(e) => modifyFlowerData(e, index)} 
                                />
                            </td>
                            <td>
                                <NumberInputWithNoScroll
                                    className='w-full no-spinner' 
                                    name='unitprice' 
                                    value={flower.unitprice} 
                                    onChange={(e) => modifyFlowerData(e, index)} 
                                />
                            </td>
                            <td>${(flower.numstems * flower.unitprice).toFixed(2)}</td>
                            <td>
                                <button onClick={() => removeFlower(index)} className="text-red-500 hover:text-red-700">Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <div className="flex justify-between items-center mb-4">
                <p className="font-bold">Total: ${calculateTotal()}</p>
                <button onClick={() => setAddFlowerPopup(true)} className="buton-secondary">
                    Add Flower
                </button>
            </div>
            <button onClick={handleSaveFlowers} className="w-full buton-main">
                Save Flowers
            </button>
        </div>
    )
}


