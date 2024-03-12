import React, { useEffect, useRef, useState } from 'react'
import PopupBase from '../PopupBase'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import SearchableDropdown from '../Dropdowns/SearchableDropdown'
import useAlert from '../../hooks/useAlert'

const baseArrangementData = { 
  arrangementType: '', 
  arrangementDescription: '', 
  clientCost: '', 
  arrangementQuantity: '' 
}

const GET_ARRANGEMENT_TYPES_URL = '/api/arrangements/types'
const EDIT_ARRANGEMENT_URL = '/api/arrangements/edit/'
const CREATE_ARRANGEMENT_URL = '/api/projects/addArrangement/'

export default function EditArrangementPopup({showPopup, closePopup, arrangementData, projectData}) {
  const [newArrangementData, setNewArrangementData] = useState(baseArrangementData)
  const [arrangementTypes, setArrangementTypes] = useState()
  const isCreatingNew = useRef(false)
  const {setMessage} = useAlert()

  const axiosPrivate = useAxiosPrivate()

  if (!arrangementData){
    isCreatingNew.current = true
  } else {
    isCreatingNew.current = false

  }

  const handleClosePopup = (bool) => {
    setNewArrangementData(baseArrangementData)
    isCreatingNew.current = false
    closePopup(bool || false)
  }

  const handleChange = (label, value) => {
    setNewArrangementData({
      ...newArrangementData,
      [label]: value,
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const arrangementsResponse = await axiosPrivate.get(GET_ARRANGEMENT_TYPES_URL)
        setArrangementTypes(arrangementsResponse?.data)

      } catch (error) {
        setMessage(error.response?.data?.message, true);
        closePopup(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (arrangementTypes && arrangementData) {
      let ix = arrangementTypes?.findIndex(item => item.arrangementtypeid == arrangementData.arrangementtype)
      if (ix == -1) {
        return
      }


      setNewArrangementData({
        arrangementType: arrangementTypes[ix],
        arrangementDescription:arrangementData.arrangementdescription,
        clientCost: arrangementData.clientcost,
        arrangementQuantity: arrangementData.arrangementquantity
      })

    }
  }, [arrangementData, arrangementTypes])
  


  const saveChanges = async () => {
    try {
      let dataToSend = {...newArrangementData}
      dataToSend.arrangementType = newArrangementData.arrangementType.arrangementtypeid
      console.log("dataToSend", dataToSend)
      console.log("isCreatingNew.current", isCreatingNew.current)
      if (!isCreatingNew.current) {
        await axiosPrivate.patch(EDIT_ARRANGEMENT_URL + arrangementData.arrangementid, JSON.stringify(dataToSend))
        setMessage('Arrangement edited Succesfully', false);
      } else {
        await axiosPrivate.post(CREATE_ARRANGEMENT_URL + projectData.projectid, JSON.stringify(dataToSend))
        setMessage('Arrangement created succesfully', false)
      }

      handleClosePopup(true)
    } catch (error) {
      setMessage(error.response?.data?.message, true);
    }
  }

  return (
    <PopupBase showPopup={showPopup}>
      {arrangementTypes && (
      <div>
        <label>Arrangement Type:</label>
        <SearchableDropdown options={arrangementTypes} label='typename' selectedVal={newArrangementData.arrangementType} handleChange={(obj) => handleChange('arrangementType', obj)} placeholderText='Select Arrangement Type' />
      </div>
      )}
      <div className="mt-4">
        <label className="block">Arrangement Description:</label>
        <input type='text' value={newArrangementData.arrangementDescription} onChange={(e) => handleChange('arrangementDescription', e.target.value)} className='w-full' />
      </div>
      <div className="mt-4">
        <label>Client Cost:</label>
        <input type='number' value={newArrangementData.clientCost} onChange={(e) => handleChange('clientCost', e.target.value)} className='w-full' />
      </div>
      <div >
        <label >Arrangement Quantity:</label>
        <input type='number' value={newArrangementData.arrangementQuantity} onChange={(e) => handleChange('arrangementQuantity', e.target.value)} className='w-full' />
      </div>
      <div className='text-start mt-2'>
        <p>Total client cost: ${parseFloat(newArrangementData.clientCost * newArrangementData.arrangementQuantity).toFixed(2)}</p>
        <p>Individual flower budget: ${parseFloat(newArrangementData.clientCost * (1 - projectData.profitmargin)).toFixed(2)}</p>
        <p>Total flower budget: ${parseFloat((newArrangementData.clientCost * newArrangementData.arrangementQuantity) * (1-projectData.profitmargin)).toFixed(2)}</p>

      </div>
      
      <div className='buttons-holder'>
        <button onClick={handleClosePopup}className='buton-secondary'>Close</button>
        <button onClick={saveChanges} className='buton-main '>Submit</button>
      </div>
    </PopupBase>
  )
}
