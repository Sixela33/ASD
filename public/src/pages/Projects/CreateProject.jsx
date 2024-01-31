import React, { useEffect, useState } from 'react';
import ArrangementPopup from '../../components/ArrangementPopup';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { Link } from 'react-router-dom';
import { BASE_TD_STYLE } from '../../styles';

const CREATE_PROJECT_URL = '/api/projects/create'

const emptyArrangement = { arrangementType: '', arrangementDescription: '', flowerBudget: '', arrangementQuantity: '' }

const initialState = {
  client: '',
  description: '',
  date: '',
  contact: '',
  staffBudget: '',
  profitMargin: 0.3,
  arrangements: [],
}

export default function CreateProject() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [formState, setFormState] = useState(initialState)
    const [newArrangement, setNewArrangement] = useState(emptyArrangement)
    const [showArrangementPopup, setShowArrangementPopup] = useState(false)

    const { client, description, date, contact, staffBudget, profitMargin, arrangements } = formState

    const [totalFlowerBudget, setTotalFlowerBudget] = useState(0)

    // sums all the budgets 
    useEffect(() => {
        const sum = arrangements.reduce((accumulator, arrang) => accumulator + arrang.flowerBudget * arrang.arrangementQuantity, 0)
        setTotalFlowerBudget(sum)
    }, [arrangements])

    const addArrangement = (e) => {
        e.preventDefault()

        //if it is editing
        if (newArrangement.index != null) {
            const index = newArrangement.index
            delete newArrangement.index
            const updatedArrangementsList = [...arrangements]
            updatedArrangementsList[index] = { ...newArrangement }
            setFormState({ ...formState, arrangements: updatedArrangementsList })
        } else {
            setFormState({ ...formState, arrangements: [...arrangements, { ...newArrangement }] })
        }

        setNewArrangement(emptyArrangement)
        setShowArrangementPopup(false)
    }

    const handleInputChange = (field, value) => {
        setNewArrangement({ ...newArrangement, [field]: value })
    }

    const closePopup = () => {
        setNewArrangement(emptyArrangement)
        setShowArrangementPopup(false)
    }

    const handleEdit = (index) => {
        setNewArrangement({ ...arrangements[index], index: index })
        setShowArrangementPopup(true)
    }

    const handleFormEdit = (field, value) => {
        setFormState((prevFormState) => ({...prevFormState,[field]: value,}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!client || !description || !date || !contact || !staffBudget || !profitMargin) {
            setMessage('Please fill in all the required fields.', true)
            return
        }

        try {
            await axiosPrivate.post(CREATE_PROJECT_URL, JSON.stringify(formState))
            setMessage('Project created successfully', false)
            //setFormState(initialState)
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true)
        }
    }

    const formRowClass = 'flex flex-row space-x-4 mb-4 flex-1 w-full';
    const formColClass = "flex flex-col mb-4 w-full"
    const inputClass = "border border-gray-300 p-2 rounded "

    return (
        <div className="max-w-screen mx-auto mt-8 flex flex-col space-y-4 items-center">


            <div className='flex flex-row w-1/2 text-center'>
                <Link to='/projects' className="text-blue-500 hover:text-blue-700">go back</Link>
                <h2 className="text-2xl font-bold mb-4 mx-auto">Create Project</h2>
            </div>

            <div className='flex space-x-4'>
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className={formRowClass}>
                            <div className={formColClass}>
                                <label className="mb-1">Client:</label>
                                <input type="text" value={client} onChange={(e) => handleFormEdit('client', e.target.value)} className={inputClass} required/>
                            </div>

                            <div className={formColClass}>
                                <label className="mb-1">Project Description:</label>
                                <input type="text" value={description} onChange={(e) => handleFormEdit('description', e.target.value)} className={inputClass} required/>
                            </div>
                        </div>

                        <div className={formRowClass}>
                            <div className={formColClass}>
                                <label className="mb-1">Project Date:</label>
                                <input type="date" value={date} onChange={(e) => handleFormEdit('date', e.target.value)} className={inputClass} required/>
                            </div>

                            <div className={formColClass}>
                                <label className="mb-1">Project Contact:</label>
                                <input type="text" value={contact} onChange={(e) => handleFormEdit('contact', e.target.value)} className={inputClass} required/>
                            </div>
                        </div>

                        <div className={formRowClass}>
                            
                            <div className={formColClass}>
                                <label className="mb-1">Staff Budget:</label>
                                <input type="number" value={staffBudget} onChange={(e) => handleFormEdit('staffBudget', e.target.value)} className={inputClass} required/>
                            </div>

                            <div className={formColClass}>
                                <label className="mb-1">Profit Margin:</label>
                                <input type="number" value={profitMargin} onChange={(e) => handleFormEdit('profitMargin', e.target.value)} className={inputClass} required/>
                            </div>
                        </div>
                
                    {/* Arrangements section */}
                    <div className="p-4 rounded w-full text-center">

                            <h3 className="text-lg font-semibold mb-2">Arrangements</h3>
   
                        <table className="min-w-full borderbg-white">
                            <thead >
                                <tr>
                                    <th className={BASE_TD_STYLE}>Arrangement type</th>
                                    <th className={BASE_TD_STYLE}>Description</th>
                                    <th className={BASE_TD_STYLE}>Flower budget</th>
                                    <th className={BASE_TD_STYLE}>Quantity</th>
                                    <th className={BASE_TD_STYLE}>Client cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formState.arrangements.map((arrangement, index) => (
                
                                <tr key={index} className='bg-gray-300' onClick={() => handleEdit(index)}>
                                    <td className={BASE_TD_STYLE}>{arrangement.arrangementType}</td>
                                    <td className={BASE_TD_STYLE}>{arrangement.arrangementDescription}</td>
                                    <td className={BASE_TD_STYLE}>{arrangement.flowerBudget}</td>
                                    <td className={BASE_TD_STYLE}>{arrangement.arrangementQuantity}</td>
                                    <td className={BASE_TD_STYLE}>{(arrangement.flowerBudget * arrangement.arrangementQuantity) + (arrangement.flowerBudget * arrangement.arrangementQuantity * formState.profitMargin)}</td>
                                </tr>
                
                                ))}
                                <tr>
                                    <td>TOTAL flower budget: </td>
                                    <td>{totalFlowerBudget}</td>
                                    <td>TOTAL client cost: </td>
                                    <td>{totalFlowerBudget + (totalFlowerBudget * profitMargin)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                                
                    <ArrangementPopup showPopup={showArrangementPopup} onClose={closePopup} onSubmit={addArrangement} newArrangement={newArrangement} onInputChange={handleInputChange}/>
                    <div className=' flex flex-row'>
                        <button type="button" onClick={() => setShowArrangementPopup(true)} className="mx-auto bg-gray-500 text-white px-4 py-2 rounded focus:outline-none">Add New Arrangement</button>
                        <button type="submit" className="mx-auto bg-black text-white px-4 py-2 rounded focus:outline-none">Save Project</button>
                    </div>
                </form>
            </div>

            </div>

        </div>
      )
}
