import React, { useEffect, useState } from 'react';
import ArrangementPopup from '../../components/Popups/ArrangementPopup';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import { validateArrangement } from '../../utls/validations/ArrangementValidations';
import SearchableDropdown from '../../components/Dropdowns/SearchableDropdown';
import GoBackButton from '../../components/GoBackButton';

const CREATE_PROJECT_URL = '/api/projects/create'
const GET_ARRANGEMENT_TYPES_URL = '/api/arrangements/types'
const GET_CLIENTS_LIST = '/api/clients'

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

export default function CreateProject() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()
    const navigateTo = useNavigate()

    const [formState, setFormState] = useState(initialState)
    const [newArrangement, setNewArrangement] = useState(emptyArrangement)
    const [showArrangementPopup, setShowArrangementPopup] = useState(false)

    const [arrangementTypes, setArrangementTypes] = useState([])
    const [clientsList, setClientsList] = useState([])
 
    const { client, description, date, contact, staffBudget, profitMargin, arrangements } = formState

    const [totalFlowerBudget, setTotalFlowerBudget] = useState(0)
    const [totalTotalProfit, setTotalProfit] = useState(0)

    // sums all the budgets 
    useEffect(() => {
        const sum = arrangements.reduce((accumulator, arrang) => accumulator + arrang.clientCost * arrang.arrangementQuantity, 0)
        setTotalFlowerBudget(sum)
    }, [arrangements])

    useEffect(() => {
        setTotalProfit(totalFlowerBudget - (totalFlowerBudget *  profitMargin) - staffBudget)
    }, [totalFlowerBudget, profitMargin, staffBudget])

    const fetchData = async () => {
        try {
            const arrangementsResponse = await axiosPrivate.get(GET_ARRANGEMENT_TYPES_URL)
            setArrangementTypes(arrangementsResponse?.data)

            const clientsResponse = await axiosPrivate.get(GET_CLIENTS_LIST)
            setClientsList(clientsResponse?.data)
            
        } catch (error) {
            setMessage('Error fetching data')
            navigateTo(-1)
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
            setFormState(initialState)
            navigateTo('/projects')
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true)
        }
    }

    const formRowClass = 'flex flex-row space-x-4 mb-1 flex-1 w-full';
    const formColClass = "flex flex-col mb-1 w-full"

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>

            <div className="title-container">
                <GoBackButton/>
                <h2 className="text-2xl font-bold mb-4 mx-auto">Create Project</h2>
                <p></p>
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
                                <input type="text" value={description} onChange={(e) => handleFormEdit('description', e.target.value)} className='w-full' required/>
                            </div>
                        </div>

                        <div className={formRowClass}>
                            <div className={formColClass}>
                                <label className="mb-1">Project Date:</label>
                                <input type="date" value={date} onChange={(e) => handleFormEdit('date', e.target.value)} className='w-full' required/>
                            </div>

                            <div className={formColClass}>
                                <label className="mb-1">Project Contact:</label>
                                <input type="text" value={contact} onChange={(e) => handleFormEdit('contact', e.target.value)} className='w-full' required/>
                            </div>
                        </div>

                        <div className={formRowClass}>
                            
                            <div className={formColClass}>
                                <label className="mb-1">Staff Budget:</label>
                                <input type="number" value={staffBudget} onChange={(e) => handleFormEdit('staffBudget', e.target.value)} className='w-full' required/>
                            </div>

                            <div className={formColClass}>
                                <label className="mb-1">Profit Margin:</label>
                                <input type="number" value={profitMargin} onChange={(e) => handleFormEdit('profitMargin', e.target.value)} className='w-full' required/>
                            </div>
                        </div>
                
                    {/* Arrangements section */}
                    <div className="p-4 rounded w-full text-center">
                        <h3 >Arrangements</h3>

                        <div className='table-container max-h-[20vh]'>

                            <table >
                                <thead>
                                    <tr>
                                        <th>Arrangement type</th>
                                        <th>Description</th>
                                        <th>Unit Client Cost</th>
                                        <th>Unit ArrangementBudget</th>
                                        <th>Quantity</th>
                                        <th>Total Client Cost</th>
                                        <th>TOTAL Arrangement Budget</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formState.arrangements.map((arrangement, index) => (
                                        
                                        <tr key={index}  onClick={() => handleEdit(index)}>
                                        <td >{arrangement?.arrangementType.typename}</td>
                                        <td >{arrangement.arrangementDescription}</td>
                                        <td >${arrangement.clientCost}</td>
                                        <td >${parseFloat((arrangement.clientCost) *  (1-formState.profitMargin)).toFixed(1)}</td>
                                        <td >{arrangement.arrangementQuantity}</td>
                                        <td >${arrangement.clientCost * arrangement.arrangementQuantity}</td>
                                        <td >${parseFloat((arrangement.clientCost * arrangement.arrangementQuantity) *  (1-formState.profitMargin)).toFixed(1)}</td>
                                    </tr>
                    
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                     <div className='flex '>
                        <p className='mr-4'>TOTAL flower budget: ${parseFloat(totalFlowerBudget *  profitMargin).toFixed(2)}</p>
                        <p className='mr-4'>TOTAL client cost: ${totalFlowerBudget}</p>
                        <p className={totalTotalProfit>0? 'text-green-500' : 'text-red-500'}>Project Profit: ${parseFloat(totalTotalProfit).toFixed(2)}</p>
                    </div>
                       
                    <div className=' flex flex-row'>
                        <button className='buton-secondary' type="button" onClick={() => setShowArrangementPopup(true)} >Add New Arrangement</button>
                        <button className='buton-main' onClick={handleSubmit} >Save Project</button>
                    </div>
                    <ArrangementPopup showPopup={showArrangementPopup} onClose={closePopup} onSubmit={addArrangement} newArrangement={newArrangement} onInputChange={handleInputChange} arrangementTypes={arrangementTypes}/>
                </form>
            </div>

            </div>

        </div>
      )
}
