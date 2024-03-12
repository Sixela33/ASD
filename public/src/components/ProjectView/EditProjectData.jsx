import React, { useState, useEffect } from 'react'
import ConfirmationPopup from '../Popups/ConfirmationPopup'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import SearchableDropdown from '../Dropdowns/SearchableDropdown'
import useAlert from '../../hooks/useAlert'

const EDIT_PROJECT_URL = '/api/projects/'
const GET_CLIENTS_LIST = '/api/clients'

export default function EditProjectData({showPopup, closePopup, projectData}) {
  
    const [newProjectdata, setNewProjectdata] = useState(projectData)
    const [clientList, setClientsList] = useState(null)
    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleProjectData = async () => {

        const cliendIndex = clientList.findIndex(item => item.clientid == projectData.clientid)

        const aaa = {
            clientid: clientList[cliendIndex],
            projectDescription: projectData.projectdescription,
            projectDate: new Date(projectData.projectdate).toLocaleDateString('fr-CA'),
            projectContact: projectData.projectcontact,
            staffBudget: projectData.staffbudget,
            profitMargin: projectData.profitmargin
        }

        setNewProjectdata(aaa)
    }

    const fetchData = async () => {
        try {

            const clientsResponse = await axiosPrivate.get(GET_CLIENTS_LIST)
            setClientsList(clientsResponse?.data)
            console.log(clientsResponse?.data)
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
            await axiosPrivate.patch(EDIT_PROJECT_URL + projectData.projectid, JSON.stringify(dataTosend))
            setMessage('Project edited Successfully', false)
            closePopup(true)
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
        <ConfirmationPopup
            showPopup={showPopup}
            closePopup={closePopup}
            confirm={confirmEdit}>
            <div className='my-1'>
                <label>Client:</label>
                <SearchableDropdown options={clientList} label="clientname" selectedVal={newProjectdata.clientid} handleChange={(client) => handleChange('clientid', client)} placeholderText="Select Client"/>
            </div>
            <div className='my-1'>
                <label>Project Description:</label>
                <input type="text" value={newProjectdata.projectDescription} onChange={(e) => handleChange('projectDescription', e.target.value)} className='w-full' required/>
            </div>
            <div className='my-1'>
                <label>Project Date:</label>
                <input type="date" value={newProjectdata.projectDate} onChange={(e) => handleChange('projectDate', e.target.value)} className='w-full' required/>
            </div>
            <div className='my-1'>
                <label>Project Contact:</label>
                <input type="text" value={newProjectdata.projectContact} onChange={(e) => handleChange('projectContact', e.target.value)} className='w-full' required/>
            </div>
            <div className='my-1'>
                <label>Staff Budget:</label>
                <input type="number" value={newProjectdata.staffBudget} onChange={(e) => handleChange('staffBudget', e.target.value)} className='w-full' required/>
            </div>
            <div className='my-1'>
                <label>Profit Margin:</label>
                <input type="number" value={newProjectdata.profitMargin} onChange={(e) => handleChange('profitMargin', e.target.value)} className='w-full' required/>
            </div>
        </ConfirmationPopup>
  )
}
