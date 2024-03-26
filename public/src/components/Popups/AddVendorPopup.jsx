import React, { useEffect, useState } from 'react'
import ConfirmationPopup from './ConfirmationPopup'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'

const CREATE_VENDOR_URL = '/api/vendors'
const EDIT_VENDOR_URL = '/api/vendors/edit'
const DEFAULT_VENDOR_DATA = {vendorname: ''}

export default function AddVendorPopup({showPopup, closePopup, editVendorData}) {
    const [vendorData, setVendorData] = useState(editVendorData || DEFAULT_VENDOR_DATA)

    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()

    const handleClosePopup = (shouldRefresh) => {
        setVendorData(DEFAULT_VENDOR_DATA)
        closePopup(shouldRefresh)
    }

    const addNewVendor = async () => {
        try {
            if (!vendorData.vendorid) {
                await axiosPrivate.post(CREATE_VENDOR_URL, JSON.stringify(vendorData))
                setMessage('Vendor created Successfully', false)
            } else {
                await axiosPrivate.patch(EDIT_VENDOR_URL, JSON.stringify(vendorData))
                setMessage('Vendor edited Successfully', false)
            }
            handleClosePopup(true)
        } catch (error) {
            setMessage(error.response?.data, true)
        }
    }

    useEffect(() => {
        if (editVendorData) {
            setVendorData(editVendorData)
        }
    }, [editVendorData])
    
    const handleInputChange = (e) => {
        setVendorData({...vendorData, vendorname: e.target.value})
    }

  return (
    <ConfirmationPopup
    showPopup={showPopup}
    closePopup={handleClosePopup}
    confirm={addNewVendor}>
        <label>vendor Name</label>
        <input type='text' value={vendorData.vendorname} onChange={handleInputChange}></input>
    </ConfirmationPopup>
  )
}
