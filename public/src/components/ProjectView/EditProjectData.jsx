import React, { useState, useEffect } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import SearchableDropdown from '../Dropdowns/SearchableDropdown'
import useAlert from '../../hooks/useAlert'
import FormItem from '../Form/FormItem'
import FormError from '../Form/FormError'
import * as Yup from 'yup';
import PopupBase from '../PopupBase'

const EDIT_PROJECT_URL = '/api/projects/'
const GET_CLIENTS_LIST = '/api/clients'
const GET_CONTACTS_LIST = '/api/contacts'

const baseProjectSchema = Yup.object().shape({
    clientid: Yup.string().required('Client is required'),
    projectDescription: Yup.string().required('Description is required'),
    projectDate: Yup.date().nullable().transform((value, originalValue) => originalValue === "" ? null : value).min("1900-12-31", 'Date must be after 1900-12-31').max("9999-12-31", 'Date must be before 9999-12-31').required('Date is required'),
    projectEndDate: Yup.date().nullable().transform((value, originalValue) => originalValue === "" ? null : value).max("9999-12-31", 'End date must be before 9999-12-31').required('End date is required')
    .when("projectDate", {
        is: (projectDate) => projectDate !== null,
        then: (schema) => schema.min(Yup.ref('projectDate'), "End date can't be before Start date"),
    }),
    projectContact: Yup.number().required('Project contact is required').typeError('Project contact is required'),
    staffBudget: Yup.number('Staff Budget is required').required('Staff Budget is required').typeError('Staff Budget is required'),
    profitMargin: Yup.number('Profit Margin is required').required('Profit Margin is required').typeError('Profit Margin is required'),
});

export default function EditProjectData({showPopup, closePopup, projectData}) {
  
    const [newProjectdata, setNewProjectdata] = useState(projectData)
    const [clientList, setClientsList] = useState(null)
    const [contactsList, setContactsList] = useState(null)
    const [errors, setErrors] = useState({})

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleProjectData = async () => {

        const cliendIndex = clientList.findIndex(item => item.clientid == projectData.clientid)
        const contactIndex = contactsList.findIndex(item => item.contactid == projectData.projectcontact)

        const tempObject = {
            clientid: clientList[cliendIndex],
            projectDescription: projectData.projectdescription,
            projectDate: new Date(projectData.projectdate).toLocaleDateString('fr-CA'),
            projectContact: contactsList[contactIndex],
            staffBudget: projectData.staffbudget,
            profitMargin: projectData.profitmargin,
            projectEndDate: new Date(projectData.projectenddate).toLocaleDateString('fr-CA')
        }

        setNewProjectdata(tempObject)
    }

    const fetchData = async () => {
        try {
            let clientsResponse =  axiosPrivate.get(GET_CLIENTS_LIST)
            let contactsResponse = axiosPrivate.get(GET_CONTACTS_LIST)

            clientsResponse = await clientsResponse
            contactsResponse = await contactsResponse

            setClientsList(clientsResponse?.data)
            setContactsList(contactsResponse?.data)
        } catch (error) {
            setMessage('Error fetching data')
        }
    }
    
    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if(clientList && contactsList && projectData) {
            handleProjectData()
        }
    }, [projectData])

    const confirmEdit = async () => {
        try {
            const dataTosend = {
                ...newProjectdata, 
                clientid: newProjectdata?.clientid?.clientid,
                projectContact: newProjectdata.projectContact.contactid
            }
            
            let schemaErrors = null
            try {
                await baseProjectSchema.validateSync(dataTosend, { abortEarly: false })
            } catch (err) {
                let temp = {}
                err.inner.forEach(error => {
                    temp[error.path] = error.message;
                });
                schemaErrors = temp
            }

            if(schemaErrors) {
                setErrors(schemaErrors)
            } else {
                await axiosPrivate.patch(EDIT_PROJECT_URL + projectData.projectid, JSON.stringify(dataTosend))
                setMessage('Project edited Successfully', false)
                closePopup(true)
                setErrors({})
            }


        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true);
        }
    }

    const handleChange = (label, value) => {
        setNewProjectdata({
          ...newProjectdata,
          [label]: value,
        });
    }

    return newProjectdata && clientList && (
        <PopupBase 
            showPopup={showPopup}
            closePopup={closePopup}>
        <div className='my-1'>
            <label>Client:</label>
            <SearchableDropdown 
                options={clientList} 
                label="clientname" 
                selectedVal={newProjectdata.clientid} 
                handleChange={(client) => handleChange('clientid', client)} 
                placeholderText="Select Client"
            />
            <FormError error={errors.clientid}/>
        </div>
        <div>
            <label>Contact:</label>
            <SearchableDropdown
                options={contactsList}
                label={'contactname'}
                selectedVal={newProjectdata.projectContact} 
                handleChange={(contact) => handleChange('projectContact', contact)} 
                placeholderText="Select Contact"
                />
        </div>
        <FormError error={errors.projectContact}/>

        <div>
            <FormItem
                labelName="Project Description:"
                type="text"
                inputName="projectDescription"
                value={newProjectdata.projectDescription}
                handleChange={(e) => handleChange('projectDescription', e.target.value)}
                error={errors.projectDescription}
            />
            <FormItem
                labelName="Project Date:"
                type="date"
                inputName="projectDate"
                value={newProjectdata.projectDate}
                handleChange={(e) => handleChange('projectDate', e.target.value)}
                error={errors.projectDate}
            />
            <FormItem
                labelName="Project End Date:"
                type="date"
                inputName="projectEndDate"
                value={newProjectdata.projectEndDate}
                handleChange={(e) => handleChange('projectEndDate', e.target.value)}
                error={errors.projectEndDate}
            />
            <FormItem
                labelName="Staff Budget:"
                type="number"
                inputName="staffBudget"
                value={newProjectdata.staffBudget}
                handleChange={(e) => handleChange('staffBudget', e.target.value)}
                error={errors.staffBudget}
                step={0.1}

            />
            <FormItem
                labelName="Profit Margin:"
                type="number"
                inputName="profitMargin"
                value={newProjectdata.profitMargin}
                handleChange={(e) => handleChange('profitMargin', e.target.value)}
                error={errors.profitMargin}
                step={0.1}
            />
        </div>
        <div className='buttons-holder'>
            <button onClick={() => {
                closePopup()
                setErrors({})
            }} className='buton-secondary'>Cancel</button>
            <button onClick={confirmEdit} className='buton-main'>Confirm</button>
        </div>
        </PopupBase>
  )
}
