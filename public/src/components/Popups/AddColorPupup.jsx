import React, { useEffect, useRef, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import ConfirmationPopup from './ConfirmationPopup'

const ADD_COLOR_URL = '/api/flowers/colors'
const EDIT_COLOR_URL = '/api/flowers/colors'
const DEFAULT_COLOR_DATA = {}

export default function AddColorPupup({showPopup, closePopup, editClorData}) {
    const [colorData, setColorData] = useState(editClorData || DEFAULT_COLOR_DATA)
    const inputRef = useRef(null) 

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleClosePopup = (shouldRefresh) => {
        setColorData(DEFAULT_COLOR_DATA)
        closePopup(shouldRefresh)
    }

    const addNewColor = async () => {
        try {
            if (!colorData.colorID) {
                await axiosPrivate.post(ADD_COLOR_URL, JSON.stringify(colorData))
                setMessage('Color added Successfully', false)
            } else {
                await axiosPrivate.patch(EDIT_COLOR_URL, JSON.stringify(colorData))
                setMessage('Color edited Successfully', false)
            }
            handleClosePopup(true)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    useEffect(() => {
        if(editClorData) {
            setColorData({
                colorName: editClorData.colorname,
                colorID: editClorData.colorid
            })
        }
    }, [editClorData])

    const handleChange = (e) => {
        setColorData({...colorData, colorName: e.target.value})
    }

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
    confirm={addNewColor}>
        <h2>{colorData.colorID ? "Edit color name" : "Add new color"}</h2>
        <br/>
        <label>Color Name</label> 
        <input ref={inputRef} type='text' value={colorData.colorName} onChange={handleChange}></input>
    </ConfirmationPopup>
  )
}
