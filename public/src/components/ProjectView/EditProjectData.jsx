import React, { useState, useEffect } from 'react'
import ConfirmationPopup from '../Popups/ConfirmationPopup'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import SearchableDropdown from '../Dropdowns/SearchableDropdown'
import useAlert from '../../hooks/useAlert'
import FormItem from '../Form/FormItem'
import FormError from '../Form/FormError'
import * as Yup from 'yup';
import PopupBase from '../PopupBase'

const EDIT_PROJECT_URL = '/api/projects/'
const GET_CLIENTS_LIST = '/api/clients'

const baseProjectSchema = Yup.object().shape({
    clientid: Yup.string().required('Client is required'),
    projectDescription: Yup.string().required('Description is required'),
    projectDate: Yup.string().required('Date is required'),
    projectContact: Yup.string().required('Contact is required'),
    staffBudget: Yup.number('Staff Budget is required').required('Staff Budget is required').typeError('Staff Budget is required'),
    profitMargin: Yup.number('Profit Margin is required').required('Profit Margin is required').typeError('Profit Margin is required'),
});

export default function EditProjectData({showPopup, closePopup, projectData}) {
  
    const [newProjectdata, setNewProjectdata] = useState(projectData)
    const [clientList, setClientsList] = useState(null)
    const [errors, setErrors] = useState({})

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleProjectData = async () => {

        const cliendIndex = clientList.findIndex(item => item.clientid == projectData.clientid)

        const tempObject = {
            clientid: clientList[cliendIndex],
            projectDescription: projectData.projectdescription,
            projectDate: new Date(projectData.projectdate).toLocaleDateString('fr-CA'),
            projectContact: projectData.projectcontact,
            staffBudget: projectData.staffbudget,
            profitMargin: projectData.profitmargin
        }

        setNewProjectdata(tempObject)
    }

    const fetchData = async () => {
        try {
            const clientsResponse = await axiosPrivate.get(GET_CLIENTS_LIST)
            setClientsList(clientsResponse?.data)
        } catch (error) {
            setMessage('Error fetching data')
        }
    }
    
    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if(clientList) {
            handleProjectData()
        }
    }, [projectData])

    const confirmEdit = async () => {
        try {
            const dataTosend = {...newProjectdata, clientid: newProjectdata.clientid.clientid}

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
            console.log(schemaErrors)
            if(schemaErrors) {
                setErrors(schemaErrors)
            } else {
                await axiosPrivate.patch(EDIT_PROJECT_URL + projectData.projectid, JSON.stringify(dataTosend))
                setMessage('Project edited Successfully', false)
                closePopup(true)
            }

        } catch (error) {
            setMessage(error.response?.data?.message, true);
        }
    }
    
    const handleChange = (label, value) => {
        setNewProjectdata({
          ...newProjectdata,
          [label]: value,
        });
      }

    return newProjectdata && (
        <PopupBase showPopup={showPopup}>
        <div className='my-1'>
            <label>Client:</label>
            <SearchableDropdown options={clientList} label="clientname" selectedVal={newProjectdata.clientid} handleChange={(client) => handleChange('clientid', client)} placeholderText="Select Client"/>
            <FormError error={errors.client}/>
        </div>
        <div>
            <FormItem
                labelName="Project Description:"
                type="text"
                inputName="projectDescription"
                value={newProjectdata.projectDescription}
                handleChange={(e) => handleChange('projectDescription', e.target.value)}
                error={errors.description}

            />
            <FormItem
                labelName="Project Date:"
                type="date"
                inputName="projectDate"
                value={newProjectdata.projectDate}
                handleChange={(e) => handleChange('projectDate', e.target.value)}
                error={errors.date}

            />
            <FormItem
                labelName="Project Contact:"
                type="text"
                inputName="projectContact"
                value={newProjectdata.projectContact}
                handleChange={(e) => handleChange('projectContact', e.target.value)}
                error={errors.contact}

            />
            <FormItem
                labelName="Staff Budget:"
                type="number"
                inputName="staffBudget"
                value={newProjectdata.staffBudget}
                handleChange={(e) => handleChange('staffBudget', e.target.value)}
                error={errors.staffBudget}

            />
            <FormItem
                labelName="Profit Margin:"
                type="number"
                inputName="profitMargin"
                value={newProjectdata.profitMargin}
                handleChange={(e) => handleChange('profitMargin', e.target.value)}
                error={errors.profitMargin}
            />
        </div>
        <div className='buttons-holder'>
            <button onClick={closePopup} className='buton-secondary'>Cancel</button>
            <button onClick={confirmEdit} className='buton-main'>Confirm</button>
        </div>
        </PopupBase>
  )
}
