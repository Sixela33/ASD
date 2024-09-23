import React, { useEffect, useRef, useState } from 'react'
import ConfirmationPopup from './ConfirmationPopup'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'

const CREATE_TYPE_URL = '/api/arrangements/types'
const EDIT_TYPE_URL = '/api/arrangements/types'
const DEFAULT_TYPE_DATA = {
    typename: '',
}

export default function AddArrangementTypePopup({showPopup, closePopup, editArrangementTypeData}) {
    const [arrangementTypeData, setArrangementTypeData] = useState(editArrangementTypeData || DEFAULT_TYPE_DATA)
    const inputRef = useRef(null) 

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleClosePopup = (shouldRefresh) => {
        setArrangementTypeData(DEFAULT_TYPE_DATA)
        closePopup(shouldRefresh)
    }

    const addNewArrangementType = async () => {
        try {
            if (!arrangementTypeData.arrangementtypeid) {
                await axiosPrivate.post(CREATE_TYPE_URL, JSON.stringify(arrangementTypeData))
                setMessage('Arrangement Type created Successfully', false)
            } else {
                await axiosPrivate.patch(EDIT_TYPE_URL, JSON.stringify(arrangementTypeData))
                setMessage('Arrangement Type edited Successfully', false)
            }
            handleClosePopup(true)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    useEffect(() => {
        if (editArrangementTypeData) {
            setArrangementTypeData(editArrangementTypeData)
        }
    }, [editArrangementTypeData])
    
    const handleInputChange = (e) => {
        const { value, name } = e.target
        setArrangementTypeData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        if (showPopup && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [showPopup])

  return (
    <ConfirmationPopup
    showPopup={showPopup}
    closePopup={handleClosePopup}
    confirm={addNewArrangementType}>
        <h2>{arrangementTypeData.arrangementtypeid ? "Edit arrangement type" : "Add new arrangement type"}</h2>
        <br/>
        <div>
            <label>Name</label>
            <input ref={inputRef} type='text' name='typename' value={arrangementTypeData.typename} onChange={handleInputChange}></input>
        </div>
    </ConfirmationPopup>
  )
}
