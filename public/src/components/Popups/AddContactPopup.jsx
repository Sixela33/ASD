import React, { useEffect, useRef, useState } from 'react'
import ConfirmationPopup from './ConfirmationPopup'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'

const CREATE_CONTACT_URL = '/api/contacts'
const EDIT_CONTACT_URL = '/api/contacts'
const DEFAULT_CONTACT_DATA = {contactname: ''}

export default function AddContactPopup({showPopup, closePopup, editContactData}) {
    const [contactData, setContactData] = useState(editContactData || DEFAULT_CONTACT_DATA)
    const inputRef = useRef(null) 

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleClosePopup = (shouldRefresh) => {
        setContactData(DEFAULT_CONTACT_DATA)
        closePopup(shouldRefresh)
    }

    const addNewContact = async () => {
        try {
            if (!contactData.contactid) {
                await axiosPrivate.post(CREATE_CONTACT_URL, JSON.stringify(contactData))
                setMessage('Contact created Successfully', false)
            } else {
                await axiosPrivate.patch(EDIT_CONTACT_URL, JSON.stringify(contactData))
                setMessage('Contact edited Successfully', false)
            }
            handleClosePopup(true)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    useEffect(() => {
        if (editContactData) {
            setContactData(editContactData)
        }
    }, [editContactData])

    useEffect(() => {
        if (showPopup && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [showPopup])
    
    const handleInputChange = (e) => {
        setContactData({...contactData, contactname: e.target.value})
    }

  return (
    <ConfirmationPopup
    showPopup={showPopup}
    closePopup={handleClosePopup}
    confirm={addNewContact}>
        <h2>{contactData.contactid ? "Edit contact name" : "Add new contact"}</h2>
        <br/>
        <label>Contact Name: </label>
        <input ref={inputRef} type='text' value={contactData.contactname} onChange={handleInputChange}></input>
    </ConfirmationPopup>
  )
}
