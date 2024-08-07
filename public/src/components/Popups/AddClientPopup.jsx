import React, { useEffect, useRef, useState } from 'react'
import ConfirmationPopup from './ConfirmationPopup'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'

const CREATE_CLIENT_URL = '/api/clients'
const EDIT_CLIENT_URL = '/api/clients'
const DEFAULT_CLIENT_DATA = {clientname: ''}

export default function AddClientPopup({showPopup, closePopup, editClientData}) {
    const [clientData, setClientData] = useState(editClientData || DEFAULT_CLIENT_DATA)
    const inputRef = useRef(null) 

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleClosePopup = (shouldRefresh) => {
        setClientData(DEFAULT_CLIENT_DATA)
        closePopup(shouldRefresh)
    }

    const addNewClient = async () => {
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
        if (editClientData) {
            setClientData(editClientData)
        }
    }, [editClientData])

    useEffect(() => {
        if (showPopup && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [showPopup])
    
    const handleInputChange = (e) => {
        setClientData({...clientData, clientname: e.target.value})
    }

  return (
    <ConfirmationPopup
    showPopup={showPopup}
    closePopup={handleClosePopup}
    confirm={addNewClient}>
        <h2>{clientData.clientid ? "Edit client name" : "Add new client"}</h2>
        <br/>
        <label>Client Name: </label>
        <input ref={inputRef} type='text' value={clientData.clientname} onChange={handleInputChange}></input>
    </ConfirmationPopup>
  )
}
