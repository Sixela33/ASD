import React, { useEffect, useState } from 'react';
import ArrangementPopup from '../../components/ArrangementPopup';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import { validateArrangement } from '../../utls/validations/ArrangementValidations';
import { BASE_TD_STYLE } from '../../styles';
import SearchableDropdown from '../../components/Dropdowns/SearchableDropdown';
import GoBackButton from '../../components/GoBackButton';

const CREATE_PROJECT_URL = '/api/projects/create'

const emptyArrangement = { arrangementType: '', arrangementDescription: '', clientCost: '', arrangementQuantity: '' }

const initialState = {
  client: '',
  description: '',
  date: '',
  contact: '',
  staffBudget: '',
  profitMargin: 0.7,
  arrangements: [],
}

const GET_ARRANGEMENT_TYPES_URL = '/api/arrangements/types'
const GET_CLIENTS_LIST = '/api/clients'

export default function CreateProject() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()
    const navigateTo = useNavigate();

    const [formState, setFormState] = useState(initialState)
    const [newArrangement, setNewArrangement] = useState(emptyArrangement)
    const [showArrangementPopup, setShowArrangementPopup] = useState(false)

    const [arrangementTypes, setArrangementTypes] = useState([])
    const [clientsList, setClientsList] = useState([])
 
    const { client, description, date, contact, staffBudget, profitMargin, arrangements } = formState

    const [totalFlowerBudget, setTotalFlowerBudget] = useState(0)

    // sums all the budgets 
    useEffect(() => {
        const sum = arrangements.reduce((accumulator, arrang) => accumulator + arrang.clientCost * arrang.arrangementQuantity, 0)
        setTotalFlowerBudget(sum)
    }, [arrangements])

    const fetchData = async () => {
        try {
            const arrangementsResponse = await axiosPrivate.get(GET_ARRANGEMENT_TYPES_URL)
            setArrangementTypes(arrangementsResponse?.data)

            const clientsResponse = await axiosPrivate.get(GET_CLIENTS_LIST)
            setClientsList(clientsResponse?.data)
            
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fetchData()
    }, [])

    const addArrangement = (e) => {
        e.preventDefault()

        const updatedArrangementsList = [...arrangements]
        if (newArrangement.index != null) {
            const index = newArrangement.index
            delete newArrangement.index
            updatedArrangementsList[index] = { ...newArrangement }
        } else {
            updatedArrangementsList.push(newArrangement)
        }

        const validationResult = validateArrangement(newArrangement)
        if (!validationResult.success){
            setMessage(validationResult.message)
            return
        }
        
        setFormState({ ...formState, arrangements: updatedArrangementsList })

        setNewArrangement(emptyArrangement)
        setShowArrangementPopup(false)
    }

    const handleInputChange = (field, value) => {
        setNewArrangement({ ...newArrangement, [field]: value })
    }

    const closePopup = () => {
        setNewArrangement(emptyArrangement)
        console.log(formState.arrangements)
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

        // Removing the name from the arrangementType object to make it just the id
        // The same with the client
        const newData = {
            ...formState,
            client: formState.client.clientid,
            arrangements: formState.arrangements.map(arrangement => ({
              ...arrangement,
              arrangementType: arrangement.arrangementType.arrangementtypeid
            }))
        };
        console.log("ND", newData)

        try {
            await axiosPrivate.post(CREATE_PROJECT_URL, JSON.stringify(newData))
            setMessage('Project created successfully', false)
            //setFormState(initialState)
            //navigateTo('/projects')
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true)
        }
    }

    const formRowClass = 'flex flex-row space-x-4 mb-4 flex-1 w-full';
    const formColClass = "flex flex-col mb-4 w-full"
    const inputClass = "border border-gray-300 p-2 rounded"

    return (
        <div className="max-w-screen mx-auto mt-8 flex flex-col space-y-4 items-center">


            <div className='flex flex-row w-1/2 text-center'>
                <GoBackButton/>
                <h2 className="text-2xl font-bold mb-4 mx-auto">Create Project</h2>
            </div>

            <div className='flex space-x-4'>
                <div className="flex-1">
                    <form className="space-y-4">
                        <div className={formRowClass}>
                            <div className={formColClass}>
                                <label className="mb-1">Client:</label>
                                <SearchableDropdown options={clientsList} label="clientname" selectedVal={client} handleChange={(client) => handleFormEdit('client', client)} placeholderText="Select Client"/>
                                <p>new client</p>
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
                                <span  className='border border-gray-300 pl-1 rounded '>$<input  className='p-2 w-96' type="number" value={staffBudget} onChange={(e) => handleFormEdit('staffBudget', e.target.value)} required/></span>
                            </div>

                            <div className={formColClass}>
                                <label className="mb-1">Profit Margin:</label>
                                <input type="number" value={profitMargin} onChange={(e) => handleFormEdit('profitMargin', e.target.value)} className={inputClass} required/>
                            </div>
                        </div>
                
                    {/* Arrangements section */}
                    <div className="p-4 rounded w-full text-center">
                        <h3 className="text-lg font-semibold mb-2">Arrangements</h3>

                        <div className='overflow-y-scroll h-full max-h-[30vh]'>

                        <table className="min-w-full borderbg-white ">
                            <thead>
                                <tr>
                                    <th className={BASE_TD_STYLE}>Arrangement type</th>
                                    <th className={BASE_TD_STYLE}>Description</th>
                                    <th className={BASE_TD_STYLE}>Unit Client Cost</th>
                                    <th className={BASE_TD_STYLE}>Unit ArrangementBudget</th>
                                    <th className={BASE_TD_STYLE}>Quantity</th>
                                    <th className={BASE_TD_STYLE}>Total Client Cost</th>
                                    <th className={BASE_TD_STYLE}>TOTAL Arrangement Budget</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formState.arrangements.map((arrangement, index) => (
                                    
                                    <tr key={index} className='bg-gray-300' onClick={() => handleEdit(index)}>
                                    <td className={BASE_TD_STYLE}>{arrangement?.arrangementType.typename}</td>
                                    <td className={BASE_TD_STYLE}>{arrangement.arrangementDescription}</td>
                                    <td className={BASE_TD_STYLE}>${arrangement.clientCost}</td>
                                    <td className={BASE_TD_STYLE}>${parseFloat((arrangement.clientCost) *  (1-formState.profitMargin)).toFixed(1)}</td>
                                    <td className={BASE_TD_STYLE}>{arrangement.arrangementQuantity}</td>
                                    <td className={BASE_TD_STYLE}>${arrangement.clientCost * arrangement.arrangementQuantity}</td>
                                    <td className={BASE_TD_STYLE}>${parseFloat((arrangement.clientCost * arrangement.arrangementQuantity) *  (1-formState.profitMargin)).toFixed(1)}</td>
                                </tr>
                
                                ))}
                            </tbody>
                        </table>
                        </div>

                    </div>
                    <div>
                        <div>
                            <p> TOTAL flower budget: ${parseFloat(totalFlowerBudget *  profitMargin).toFixed(2)}</p>
                        </div>
                        <div>
                            <p>TOTAL client cost: ${totalFlowerBudget}</p>
                        </div>
                    </div>
                       
                    <div className=' flex flex-row'>
                        <button type="button" onClick={() => setShowArrangementPopup(true)} className="mx-auto bg-gray-500 text-white px-4 py-2 rounded focus:outline-none">Add New Arrangement</button>
                        <button onClick={handleSubmit} className="mx-auto bg-black text-white px-4 py-2 rounded focus:outline-none">Save Project</button>
                    </div>
                    <ArrangementPopup showPopup={showArrangementPopup} onClose={closePopup} onSubmit={addArrangement} newArrangement={newArrangement} onInputChange={handleInputChange} arrangementTypes={arrangementTypes}/>
                </form>
            </div>

            </div>

        </div>
      )
}
