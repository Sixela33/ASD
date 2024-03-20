import React, { useEffect, useState } from 'react'
import ConfirmationPopup from './ConfirmationPopup'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'

const CREATE_CLIENT_URL = '/api/clients'
const EDIT_CLIENT_URL = '/api/clients/edit'
const DEFAULT_CLIENT_DATA = {clientname: ''}

export default function AddClientPopup({showPopup, closePopup, editClientData}) {
    const [clientData, setClientData] = useState(editClientData || DEFAULT_CLIENT_DATA)

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleClosePopup = (shouldRefresh) => {
        setClientData(DEFAULT_CLIENT_DATA)
        closePopup(shouldRefresh)
    }

    const addNewClient = async () => {
        console.log("clientData", clientData)
        try {
            if (!clientData.clientid) {
                await axiosPrivate.post(CREATE_CLIENT_URL, JSON.stringify(clientData))
                setMessage('Client created Successfully', false)
            } else {
                await axiosPrivate.patch(EDIT_CLIENT_URL, JSON.stringify(clientData))
                setMessage('Client edited Successfully', false)
            }
            handleClosePopup(true)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    useEffect(() => {
        console.log("editClientData", editClientData)
        if (editClientData) {
            setClientData(editClientData)
        }
    }, [editClientData])
    
    const handleInputChange = (e) => {
        setClientData({...clientData, clientname: e.target.value})
    }

  return (
    <ConfirmationPopup
    showPopup={showPopup}
    closePopup={handleClosePopup}
    confirm={addNewClient}>
        <label>New Client Name: </label>
        <input type='text' value={clientData.clientname} onChange={handleInputChange}></input>
    </ConfirmationPopup>
  )
}
