import React, { useEffect, useState } from 'react';
import ArrangementPopup from '../../components/Popups/ArrangementPopup';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import SearchableDropdown from '../../components/Dropdowns/SearchableDropdown';
import GoBackButton from '../../components/GoBackButton';
import AddClientPopup from '../../components/Popups/AddClientPopup';
import * as Yup from 'yup';
import FormItem from '../../components/Form/FormItem';
import FormError from '../../components/Form/FormError';
import AddAditionalExpensePopup from '../../components/Popups/AddAditionalExpensePopup';
import { toCurrency } from '../../utls/toCurrency';
import LoadingPopup from '../../components/LoadingPopup';

const CREATE_PROJECT_URL = '/api/projects/create'
const GET_ARRANGEMENT_TYPES_URL = '/api/arrangements/types'
const GET_CLIENTS_LIST = '/api/clients'

const emptyArrangement = { 
    arrangementType: '', 
    arrangementDescription: '', 
    clientCost: '', 
    arrangementQuantity: '' ,
    installationTimes: '', 
    arrangementLocation: ''
}

const initialState = {
  client: '',
  description: '',
  date: '',
  endDate: '',
  contact: '',
  staffBudget: 0.3,
  profitMargin: 0.7,
  isRecurrent: false
}

const baseProjectStatsData = {
    totalFlowerCost: 0,
    totalExtrasCost: 0,
    totalProjectCost: 0,
    totalFlowerBudget: 0,
    totalStaffBudget: 0,
    totalProjectProfit: 0
}

const baseProjectSchema = Yup.object().shape({
    client: Yup.string().required('Client is required'),
    description: Yup.string().required('Description is required').max(255, 'The description cannot be longet than 255 characters'),
    date: Yup.date().nullable().transform((value, originalValue) => originalValue === "" ? null : value).min("1900-12-31", 'Date must be after 1900-12-31').max("9999-12-31", 'Date must be before 9999-12-31').required('Date is required'),
    endDate: Yup.date().nullable().transform((value, originalValue) => originalValue === "" ? null : value).max("9999-12-31", 'End date must be before 9999-12-31').required('End date is required')
        .when("date", {
            is: (date) => date !== null,
            then: (schema) => schema.min(Yup.ref('date'), "End date can't be before Start date"),
        }),
    contact: Yup.string().required('Contact is required').max(50, 'the contact cannot be longet than 50 characters'),
    staffBudget: Yup.number('Staff Budget is required').min(0).required('Staff Budget is required').typeError('Staff Budget is required'),
    profitMargin: Yup.number('Profit Margin is required').min(0).required('Profit Margin is required').typeError('Profit Margin is required'),
    isRecurrent: Yup.boolean('isRecurrent is required').required('isRecurrent is required').typeError('isRecurrent is required'),
});

const arrangementSchema = Yup.object().shape({
    arrangementType: Yup.object().required('The arrangement type is required').typeError('The arrangement type is required'), 
    arrangementDescription: Yup.string().required('Arrangement Description is required').max(255, 'The description cannot be longet than 255 characters'), 
    clientCost: Yup.number().required('The client cost is required').typeError('The client cost is required'), 
    arrangementQuantity: Yup.number().required('The Arrangement quantity is required').typeError('The Arrangement quantity is required').min(1),
    installationTimes: Yup.number().required('The Arrangement must be installed at least once').typeError('The Arrangement must be installed at least once').min(1), 
    arrangementLocation: Yup.string().required('Arrangement location is required').max(255, 'The location cannot be longet than 100 characters')
})

export default function CreateProject() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()
    const navigateTo = useNavigate()

    const [formState, setFormState] = useState(initialState)
    const [arrangements, setArrangements] = useState([])
    const [aditionalExpenses, setAditionallExpenses] = useState([])
    const [showExpensesPopup, setShowExpensesPopup] = useState(false)
    const [editExpense, setExpenseToEdit] = useState({})

    const [errors, setErrors] = useState({})
    const [newArrangementErrors, setnewArrangementErrors] = useState({})

    const [newArrangement, setNewArrangement] = useState(emptyArrangement)
    const [showArrangementPopup, setShowArrangementPopup] = useState(false)

    const [arrangementTypes, setArrangementTypes] = useState([])
    const [clientsList, setClientsList] = useState([])
    
    const [projectStats, setProjectStats] = useState(baseProjectStatsData)
    const [showNewClientPopup, setShowNewClientPopup] = useState(false)
    const [refreshUe, setrefreshUe] = useState(false)
    const [isSubmitting, setIsSubmiting] = useState(false)

    const { client, description, date, contact, staffBudget, profitMargin, isRecurrent, endDate } = formState

    // sums all the budgets 
    useEffect(() => {
        let tempProjectStats = {}
        let totalFlowerCost = arrangements.reduce((accumulator, arrang) => accumulator + arrang.clientCost * arrang.arrangementQuantity * arrang.installationTimes, 0)
        let totalAditional = aditionalExpenses.reduce((accumulator, expense) => accumulator + (expense.clientcost * expense.ammount) , 0)
        
        totalFlowerCost = totalFlowerCost || 0
        totalAditional = totalAditional || 0
        
        tempProjectStats.totalFlowerCost = totalFlowerCost
        tempProjectStats.totalExtrasCost = totalAditional
        tempProjectStats.totalFlowerBudget = totalFlowerCost * (1-profitMargin)
        tempProjectStats.totalProjectCost = totalFlowerCost + totalAditional
        tempProjectStats.totalStaffBudget = tempProjectStats.totalProjectCost * staffBudget
        tempProjectStats.totalProjectProfit = tempProjectStats.totalProjectCost - tempProjectStats.totalFlowerBudget - tempProjectStats.totalStaffBudget
        
        setProjectStats(tempProjectStats)
    }, [arrangements, aditionalExpenses, formState, refreshUe])

    const fetchData = async () => {
        try {
            const arrangementsResponse = await axiosPrivate.get(GET_ARRANGEMENT_TYPES_URL)
            setArrangementTypes(arrangementsResponse?.data)

            await getClientList()
            
        } catch (error) {
            setMessage(error.response?.data, true);
            navigateTo(-1)
        }
    }

    const getClientList = async () => {
        try {
            const clientsResponse = await axiosPrivate.get(GET_CLIENTS_LIST)
            setClientsList(clientsResponse?.data)
        } catch (error) {
            setMessage(error.response?.data, true);

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
        setnewArrangementErrors({})
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
        try {
            setIsSubmiting(true)
           
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
            newData.extras = aditionalExpenses
    
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
        } catch (error) {
            console.log(error)

        }finally {
            setIsSubmiting(false)
        }
    }

    const handleCloseNewClientPopup = (shouldRefresh) => {
        
        if(shouldRefresh) {
            getClientList()
        }
        
        setShowNewClientPopup(false)
    }

    const addNewExpense = (expense) => {
        if(expense.index == undefined) {
            setAditionallExpenses([...aditionalExpenses,  expense])
        } else {
            const tempAditionalExpenses = aditionalExpenses
            const tempIndex = expense.index
            delete expense.index
            tempAditionalExpenses[tempIndex] = expense
            setAditionallExpenses(tempAditionalExpenses)
        }
        setrefreshUe(!refreshUe)
    }

    const editExistingExpense = (expense) => {
        const index = aditionalExpenses.findIndex(element => element == expense)
        setExpenseToEdit({...expense, 'index': index})
        setShowExpensesPopup(true)
    }


    const formRowClass = 'flex flex-row space-x-4  flex-1 w-full';
    const formColClass = "flex flex-col w-full"

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>
            <LoadingPopup
                showPopup={isSubmitting}>
            </LoadingPopup>
            <AddClientPopup showPopup={showNewClientPopup} closePopup={handleCloseNewClientPopup} />
            <ArrangementPopup showPopup={showArrangementPopup} onClose={closePopup} onSubmit={addArrangement} newArrangement={newArrangement} onInputChange={handleInputChange} arrangementTypes={arrangementTypes} newArrangementErrors={newArrangementErrors}/>
            <AddAditionalExpensePopup 
                showPopup={showExpensesPopup} 
                closePopup={() => setShowExpensesPopup(false)} 
                submitFunc={addNewExpense} 
                projectData={''} 
                editExpense={editExpense}/>
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
                            <FormItem labelName="Project Description:" type="text" inputName="description" value={description} handleChange={(e) => handleFormEdit('description', e.target.value)} error={errors.description} />                 
                            </div>
                        </div>

                        <div>
                        <div className={formRowClass}>
                            <div className={formColClass}>
                                <div className='flex justify-evenly md:flex-row'>
                                    <div className='flex flex-col w-full mx-1'>
                                        <FormItem labelName="Starting Date:" type="date" inputName="date" max="9999-12-31" value={date} handleChange={(e) => handleFormEdit('date', e.target.value)} error={errors.date}/>
                                    </div>
                                    <div className='flex flex-col w-full mx-1'>
                                        <FormItem labelName="Closing Date:" type="date" inputName="date" max="9999-12-31" value={endDate} handleChange={(e) => handleFormEdit('endDate', e.target.value)} error={errors.endDate}/>

                                    </div>
                                </div>
                            </div>

                            <div className={formColClass}>
                            <FormItem labelName="Project Contact:" type="text" inputName="contact" value={contact} handleChange={(e) => handleFormEdit('contact', e.target.value)} error={errors.contact} />
                            </div>
                        </div>

                        <div className={formRowClass}>
                            <div className={formColClass}>
                            <FormItem labelName="Staff Budget percentage:" step='0.1' type="number" inputName="staffBudget" value={staffBudget} handleChange={(e) => handleFormEdit('staffBudget', e.target.value)} error={errors.staffBudget} />
                            </div>

                            <div className={formColClass}>
                            <FormItem labelName="Profit Margin:" step='0.1' type="number" inputName="profitMargin" value={profitMargin} handleChange={(e) => handleFormEdit('profitMargin', e.target.value)} error={errors.profitMargin} />
                            </div>
                        </div>
                        </div>
                    
                    <div className='grid grid-cols-3'>
                        <div className="p-4 rounded w-full text-center col-span-2">
                            <h3 >Arrangements</h3>

                            <div className='table-container h-[20vh]'>

                                <table >
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Unit Cost</th>
                                            <th>Unit Budget</th>
                                            <th>Quantity</th>
                                            <th>Installation times</th>
                                            <th>Total Cost</th>
                                            <th>Total Budget</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {arrangements.map((arrangement, index) => (
                                            <tr key={index}  onClick={() => handleEdit(index)}>
                                                <td>{arrangement?.arrangementType.typename}</td>
                                                <td>{arrangement.arrangementDescription}</td>
                                                <td>${arrangement.clientCost}</td>
                                                <td>${toCurrency((arrangement.clientCost) *  (1-formState.profitMargin))}</td>
                                                <td>{arrangement.arrangementQuantity}</td>
                                                <td>{arrangement.installationTimes}</td>
                                                <td>${arrangement.clientCost * arrangement.arrangementQuantity * arrangement.installationTimes}</td>
                                                <td>${toCurrency((arrangement.clientCost * arrangement.arrangementQuantity * arrangement.installationTimes) *  (1-formState.profitMargin))}</td>
                                            </tr>
                            
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='p-4 rounded w-full text-center col-span-1'>
                            <h3>Aditional Expenses</h3>
                            <div className='table-container h-[20vh]'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Client cost</th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {aditionalExpenses.map((expense, index) => {
                                        return <tr key={index} onClick={() => editExistingExpense(expense)}>
                                            <td>{expense.description}</td>
                                            <td>${toCurrency(expense.clientcost)}</td>
                                            <td>{expense.ammount}</td>
                                        </tr>
                                    })}
                                </tbody>
                                </table>
                            </div>
                           
                        </div>
                    </div>

                     <div className='flex '>
                        <p className='mr-4'>Total client cost: ${projectStats.totalProjectCost}</p>
                        <p className='mr-4'>Total flower budget: ${toCurrency(projectStats.totalFlowerBudget)}</p>
                        <p className='mr-4'>Total aditional costs: ${toCurrency(projectStats.totalExtrasCost)}</p>
                        <p className='mr-4'>Total flower costs: ${toCurrency(projectStats.totalFlowerCost)}</p>
                        <p className='mr-4'>Total staff budget: ${toCurrency(projectStats.totalStaffBudget)}</p>

                        <p className={projectStats.totalProjectProfit>0? 'text-green-500' : 'text-red-500'}>Project Profit: ${toCurrency(projectStats.totalProjectProfit)}</p>
                    </div>
                       
                    <div className=' flex flex-row'>
                        <button className='buton-secondary' type="button" onClick={() => setShowArrangementPopup(true)} >Add New Arrangement</button>
                        <button className='buton-secondary mx-3' onClick={() => setShowExpensesPopup(true)}>Add extra service</button>
                        <button className='buton-main' onClick={handleSubmit} >Save Project</button>
                        <div className='flex items-center mx-3'>
                            <label>Is Recurrent</label>
                            <input type='checkbox' value={isRecurrent} onChange={() => handleFormEdit('isRecurrent', !isRecurrent)}></input>
                        </div>
                    </div>
                </div>
            </div>

            </div>

        </div>
      )
}
