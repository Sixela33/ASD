import React, { useEffect, useRef, useState } from 'react'
import PopupBase from '../PopupBase'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import SearchableDropdown from '../Dropdowns/SearchableDropdown'
import useAlert from '../../hooks/useAlert'
import * as Yup from 'yup';
import FormError from '../Form/FormError'
import FormItem from '../Form/FormItem'
import { toCurrency } from '../../utls/toCurrency'

const baseArrangementData = { 
  arrangementType: '', 
  arrangementDescription: '', 
  clientCost: '', 
  arrangementQuantity: '' 
}

const arrangementSchema = Yup.object().shape({
  arrangementType: Yup.object().required('The arrangement type is required').typeError('The arrangement type is required'), 
  arrangementDescription: Yup.string().required('Arrangement Description is required'), 
  clientCost: Yup.number().required('The client cost is required').typeError('The client cost is required'), 
  arrangementQuantity: Yup.number().required('The Arrangement quantity is required').typeError('The Arrangement quantity is required')
})

const GET_ARRANGEMENT_TYPES_URL = '/api/arrangements/types'
const EDIT_ARRANGEMENT_URL = '/api/arrangements/edit/'
const CREATE_ARRANGEMENT_URL = '/api/projects/addArrangement/'

export default function EditArrangementPopup({showPopup, closePopup, arrangementData, projectData}) {
  const {setMessage} = useAlert()
  const axiosPrivate = useAxiosPrivate()

  const [newArrangementData, setNewArrangementData] = useState(baseArrangementData)
  const [arrangementTypes, setArrangementTypes] = useState()
  const [newArrangementErrors, setnewArrangementErrors] = useState({})

  const isCreatingNew = useRef(false)

  if (!arrangementData){
    isCreatingNew.current = true
  } else {
    isCreatingNew.current = false

  }

  const handleClosePopup = (bool) => {
    setNewArrangementData(baseArrangementData)
    isCreatingNew.current = false
    setnewArrangementErrors({})
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
        setMessage(error.response?.data, true);
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
    let schemaErrors = null
    console.log(newArrangementData)
    try {
        arrangementSchema.validateSync(newArrangementData, { abortEarly: false })
    } catch (err) {
        schemaErrors = {}
        err.inner.forEach(error => {
            schemaErrors[error.path] = error.message;
        });
    }

    if(schemaErrors) {
        setnewArrangementErrors(schemaErrors)
        return
    }
  
    try {
      let dataToSend = {...newArrangementData}
      dataToSend.arrangementType = newArrangementData.arrangementType.arrangementtypeid

      if (!isCreatingNew.current) {
        await axiosPrivate.patch(EDIT_ARRANGEMENT_URL + arrangementData.arrangementid, JSON.stringify(dataToSend))
        setMessage('Arrangement edited Succesfully', false);
      } else {
        await axiosPrivate.post(CREATE_ARRANGEMENT_URL + projectData.projectid, JSON.stringify(dataToSend))
        setMessage('Arrangement created succesfully', false)
      }

      handleClosePopup(true)
    } catch (error) {
      setMessage(error.response?.data, true);
    }
  }

  return (
    <PopupBase showPopup={showPopup}>
      {arrangementTypes && (
      <div>
        <label>Arrangement Type:</label>
        <SearchableDropdown options={arrangementTypes} label='typename' selectedVal={newArrangementData.arrangementType} handleChange={(obj) => handleChange('arrangementType', obj)} placeholderText='Select Arrangement Type' />
        <FormError error={newArrangementErrors.arrangementType}/>
      </div>
      )}
      <div>
        <div>
          <FormItem
            labelName="Arrangement Description:"
            type="text"
            inputName="arrangementDescription"
            value={newArrangementData.arrangementDescription}
            handleChange={(e) => handleChange('arrangementDescription', e.target.value)}
            error={newArrangementErrors.arrangementDescription}
            />
        </div>
        <div>
          <FormItem
            labelName="Client Cost:"
            type="number"
            inputName="clientCost"
            value={newArrangementData.clientCost}
            handleChange={(e) => handleChange('clientCost', e.target.value)}
            error={newArrangementErrors.clientCost}
            />
        </div>
        <div>
          <FormItem
            labelName="Arrangement Quantity:"
            type="number"
            inputName="arrangementQuantity"
            value={newArrangementData.arrangementQuantity}
            handleChange={(e) => handleChange('arrangementQuantity', e.target.value)}
            error={newArrangementErrors.arrangementQuantity}
            />
        </div>
      </div>
      <div className='text-start mt-2'>
        <p>Total client cost: ${toCurrency(newArrangementData.clientCost * newArrangementData.arrangementQuantity)}</p>
        <p>Individual flower budget: ${toCurrency(newArrangementData.clientCost * (1 - projectData.profitmargin))}</p>
        <p>Total flower budget: ${toCurrency((newArrangementData.clientCost * newArrangementData.arrangementQuantity) * (1-projectData.profitmargin))}</p>
        <p>Total profit: ${toCurrency((newArrangementData.clientCost * newArrangementData.arrangementQuantity) - (newArrangementData.clientCost * newArrangementData.arrangementQuantity) * (1-projectData.profitmargin))}</p>
      </div>
      
      <div className='buttons-holder'>
        <button onClick={handleClosePopup}className='buton-secondary'>Close</button>
        <button onClick={saveChanges} className='buton-main '>Submit</button>
      </div>
    </PopupBase>
  )
}
