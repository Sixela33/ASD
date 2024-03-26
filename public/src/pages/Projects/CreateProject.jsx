import React, { useEffect, useState } from 'react';
import ArrangementPopup from '../../components/Popups/ArrangementPopup';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import SearchableDropdown from '../../components/Dropdowns/SearchableDropdown';
import GoBackButton from '../../components/GoBackButton';
import AddClientPopup from '../../components/Popups/AddClientPopup';
import * as Yup from 'yup';
import FormItem from '../../components/FormItem';
import FormError from '../../components/FormError';
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
  profitMargin: 0.7
}

const baseProjectSchema = Yup.object().shape({
    client: Yup.string().required('Client is required'),
    description: Yup.string().required('Description is required'),
    date: Yup.string().required('Date is required'),
    contact: Yup.string().required('Contact is required'),
    staffBudget: Yup.number('Staff Budget is required').required('Staff Budget is required').typeError('Staff Budget is required'),
    profitMargin: Yup.number('Profit Margin is required').required('Profit Margin is required').typeError('Profit Margin is required'),
});

const arrangementSchema = Yup.object().shape({
    arrangementType: Yup.object().required('The arrangement type is required').typeError('The arrangement type is required'), 
    arrangementDescription: Yup.string().required('Arrangement Description is required'), 
    clientCost: Yup.number().required('The client cost is required').typeError('The client cost is required'), 
    arrangementQuantity: Yup.number().required('The Arrangement quantity is required').typeError('The Arrangement quantity is required')
})

export default function CreateProject() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()
    const navigateTo = useNavigate()

    const [formState, setFormState] = useState(initialState)
    const [arrangements, setArrangements] = useState([])

    const [errors, setErrors] = useState({})
    const [newArrangementErrors, setnewArrangementErrors] = useState({})

    const [newArrangement, setNewArrangement] = useState(emptyArrangement)
    const [showArrangementPopup, setShowArrangementPopup] = useState(false)

    const [arrangementTypes, setArrangementTypes] = useState([])
    const [clientsList, setClientsList] = useState([])
 
    
    const [totalFlowerBudget, setTotalFlowerBudget] = useState(0)
    const [totalTotalProfit, setTotalProfit] = useState(0)
    const [showNewClientPopup, setShowNewClientPopup] = useState(false)
    
    const { client, description, date, contact, staffBudget, profitMargin } = formState

    // sums all the budgets 
    useEffect(() => {
        const sum = arrangements.reduce((accumulator, arrang) => accumulator + arrang.clientCost * arrang.arrangementQuantity, 0)
        setTotalFlowerBudget(sum)
        setTotalProfit(sum * profitMargin)

    }, [arrangements])

    const fetchData = async () => {
        try {
            const arrangementsResponse = await axiosPrivate.get(GET_ARRANGEMENT_TYPES_URL)
            setArrangementTypes(arrangementsResponse?.data)

            await getClientList()
            
        } catch (error) {
            setMessage(error.response?.data?.message, true);
            navigateTo(-1)
        }
    }

    const getClientList = async () => {
        try {
            const clientsResponse = await axiosPrivate.get(GET_CLIENTS_LIST)
            setClientsList(clientsResponse?.data)
        } catch (error) {
            setMessage(error.response?.data?.message, true);

        }
    }
    
    useEffect(() => {
        fetchData()
    }, [])

    const addArrangement = (e) => {
        e.preventDefault()
        let schemaErrors = null

        try {
            arrangementSchema.validateSync(newArrangement, { abortEarly: false })
        } catch (err) {
            schemaErrors = {}
            err.inner.forEach(error => {
                schemaErrors[error.path] = error.message;
            });
        }

        if(schemaErrors) {
            setnewArrangementErrors(schemaErrors)
            return
        }


        const updatedArrangementsList = [...arrangements]
        if (newArrangement.index != null) {
            const index = newArrangement.index
            delete newArrangement.index
            updatedArrangementsList[index] = { ...newArrangement }
        } else {
            updatedArrangementsList.push(newArrangement)
        }
        
        setArrangements(updatedArrangementsList)

        setNewArrangement(emptyArrangement)
        setShowArrangementPopup(false)
    }

    const handleInputChange = (field, value) => {
        setNewArrangement({ ...newArrangement, [field]: value })
    }

    const closePopup = () => {
        setNewArrangement(emptyArrangement)
        setnewArrangementErrors({})
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

        // Removing the name from the arrangementType object to make it just the id
        // The same with the client
        let newData = {
            ...formState,
            client: formState.client.clientid,
        };

        let schemaErrors = null
        try {
            await baseProjectSchema.validateSync(newData, { abortEarly: false })
        } catch (err) {
            let temp = {}
            err.inner.forEach(error => {
                temp[error.path] = error.message;
            });
            schemaErrors = temp
        }
        
        if(schemaErrors) {
            setErrors(schemaErrors)
            return
        }


        const cleanedArrangements = arrangements.map(arrangement => ({
            ...arrangement,
            arrangementType: arrangement.arrangementType.arrangementtypeid
          }))

        newData.arrangements = cleanedArrangements

        try {
            const response = await axiosPrivate.post(CREATE_PROJECT_URL, JSON.stringify(newData))
            const newProjectID = response.data.p_projectclient
            setMessage('Project created successfully', false)
            setFormState(initialState)
            navigateTo('/projects/' + newProjectID || '')
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true)
        }
    }

    const handleCloseNewClientPopup = (shouldRefresh) => {
        
        if(shouldRefresh) {
            getClientList()
        }
        
        setShowNewClientPopup(false)
    }

    const formRowClass = 'flex flex-row space-x-4 mb-1 flex-1 w-full';
    const formColClass = "flex flex-col mb-1 w-full"

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>
            <AddClientPopup
            showPopup={showNewClientPopup}
            closePopup={handleCloseNewClientPopup}
            />
            <div className="grid grid-cols-3 mb-2">
                <GoBackButton className='col-span-1'/>
                <h2 className='col-span-1'>Create Project</h2>
            </div>

            <div className='flex space-x-4'>
                <div className="flex-1">
                    <div className="space-y-4">
                        <div className={formRowClass}>
                            <div className={formColClass}>
                                <label className="mb-1">Client:</label>
                                <SearchableDropdown options={clientsList} label="clientname" selectedVal={client} handleChange={(client) => handleFormEdit('client', client)} placeholderText="Select Client"/>
                                <button onClick={() => setShowNewClientPopup(true)} className='go-back-button'>Add new Client</button>
                                <FormError error={errors.client}/>
                            </div>

                            <div className={formColClass}>
                            <FormItem
                                labelName="Project Description:"
                                type="text"
                                inputName="description"
                                value={description}
                                handleChange={(e) => handleFormEdit('description', e.target.value)}
                                error={errors.description}
                            />                 
                            </div>
                        </div>

                        <div>
                        <div className={formRowClass}>
                            <div className={formColClass}>
                            <FormItem
                                labelName="Project Date:"
                                type="date"
                                inputName="date"
                                value={date}
                                handleChange={(e) => handleFormEdit('date', e.target.value)}
                                error={errors.date}

                            />
                            </div>

                            <div className={formColClass}>
                            <FormItem
                                labelName="Project Contact:"
                                type="text"
                                inputName="contact"
                                value={contact}
                                handleChange={(e) => handleFormEdit('contact', e.target.value)}
                                error={errors.contact}
                            />
                            </div>
                        </div>

                        <div className={formRowClass}>
                            <div className={formColClass}>
                            <FormItem
                                labelName="Staff Budget:"
                                type="number"
                                inputName="staffBudget"
                                value={staffBudget}
                                handleChange={(e) => handleFormEdit('staffBudget', e.target.value)}
                                error={errors.staffBudget}
                            />
                            </div>

                            <div className={formColClass}>
                            <FormItem
                                labelName="Profit Margin:"
                                type="number"
                                inputName="profitMargin"
                                value={profitMargin}
                                handleChange={(e) => handleFormEdit('profitMargin', e.target.value)}
                                error={errors.profitMargin}
                            />
                            </div>
                        </div>
                        </div>
                
                    {/* Arrangements section */}
                    <div className="p-4 rounded w-full text-center">
                        <h3 >Arrangements</h3>

                        <div className='table-container h-[20vh]'>

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
                                    {arrangements.map((arrangement, index) => (
                                        
                                        <tr key={index}  onClick={() => handleEdit(index)}>
                                        <td>{arrangement?.arrangementType.typename}</td>
                                        <td>{arrangement.arrangementDescription}</td>
                                        <td>${arrangement.clientCost}</td>
                                        <td>${parseFloat((arrangement.clientCost) *  (1-formState.profitMargin)).toFixed(1)}</td>
                                        <td>{arrangement.arrangementQuantity}</td>
                                        <td>${arrangement.clientCost * arrangement.arrangementQuantity}</td>
                                        <td>${parseFloat((arrangement.clientCost * arrangement.arrangementQuantity) *  (1-formState.profitMargin)).toFixed(1)}</td>
                                    </tr>
                    
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                     <div className='flex '>
                        <p className='mr-4'>TOTAL flower budget: ${parseFloat(totalFlowerBudget *  (1 - profitMargin)).toFixed(2)}</p>
                        <p className='mr-4'>TOTAL client cost: ${totalFlowerBudget}</p>
                        <p className={totalTotalProfit>0? 'text-green-500' : 'text-red-500'}>Project Profit: ${parseFloat(totalTotalProfit).toFixed(2)}</p>
                    </div>
                       
                    <div className=' flex flex-row'>
                        <button className='buton-secondary mr-3' type="button" onClick={() => setShowArrangementPopup(true)} >Add New Arrangement</button>
                        <button className='buton-main' onClick={handleSubmit} >Save Project</button>
                    </div>
                    <ArrangementPopup showPopup={showArrangementPopup} onClose={closePopup} onSubmit={addArrangement} newArrangement={newArrangement} onInputChange={handleInputChange} arrangementTypes={arrangementTypes} newArrangementErrors={newArrangementErrors}/>
                </div>
            </div>

            </div>

        </div>
      )
}
