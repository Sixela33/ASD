import React, { useEffect, useState } from 'react'
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

export default function EditArrangementPopup({showPopup, closePopup, arrangementData, projectData}) {
  const [newArrangementData, setNewArrangementData] = useState(baseArrangementData)
  const [arrangementTypes, setArrangementTypes] = useState()
  const {setMessage} = useAlert()


  const axiosPrivate = useAxiosPrivate()

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
      await axiosPrivate.patch(EDIT_ARRANGEMENT_URL + arrangementData.arrangementid, JSON.stringify(dataToSend))
      setMessage('Arrangement edited Succesfully', false);
      closePopup(true)
    } catch (error) {
      setMessage(error.response?.data?.message, true);
    }
  }

  return (
    <PopupBase showPopup={showPopup}>
      {arrangementTypes && (
        <div>
        <label className="block">Arrangement Type:</label>
        <SearchableDropdown
          options={arrangementTypes}
          label='typename'
          selectedVal={newArrangementData.arrangementType}
          handleChange={(obj) => handleChange('arrangementType', obj)}
          placeholderText='Select Arrangement Type'
          />
          </div>
      )}
      <div className="mt-4">
        <label className="block">Arrangement Description:</label>
        <input
          type='text'
          value={newArrangementData.arrangementDescription}
          onChange={(e) => handleChange('arrangementDescription', e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full"
        />
      </div>
      <div className="mt-4">
        <label className="block">Client Cost:</label>
        <input
          type='number'
          value={newArrangementData.clientCost}
          onChange={(e) => handleChange('clientCost', e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full"
        />
      </div>
      <div className="mt-4">
        <label className="block">Arrangement Quantity:</label>
        <input
          type='number'
          value={newArrangementData.arrangementQuantity}
          onChange={(e) => handleChange('arrangementQuantity', e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full"
        />
      </div>
      <p>Total cient cost: ${parseFloat(newArrangementData.clientCost * newArrangementData.arrangementQuantity).toFixed(2)}</p>
      <p>Individual flower budget: ${parseFloat(newArrangementData.clientCost * (1 - projectData.profitmargin)).toFixed(2)}</p>
      <p>Total flower budget: ${parseFloat((newArrangementData.clientCost * newArrangementData.arrangementQuantity) * (1-projectData.profitmargin)).toFixed(2)}</p>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={closePopup}
          className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400">
            Close
          </button>
        <button onClick={saveChanges} 
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">
          Submit
        </button>
      </div>
    </PopupBase>
  )
}
