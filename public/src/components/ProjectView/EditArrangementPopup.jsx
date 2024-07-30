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
  arrangementQuantity: '',
  installationTimes: '',
  arrangementLocation: '',
  timesBilled: ''
}

const baseArrangementStats = {
  totalClientCost: '',
  individualFlowerBudget: '',
  totalFlowerBudget: '',
  totalProfit: '',
}

const arrangementSchema = Yup.object().shape({
  arrangementType: Yup.object().required('The arrangement type is required').typeError('The arrangement type is required'), 
  arrangementDescription: Yup.string().required('Arrangement Description is required'), 
  clientCost: Yup.number().required('The client cost is required').typeError('The client cost is required'), 
  arrangementQuantity: Yup.number().required('The Arrangement quantity is required').typeError('The Arrangement quantity is required'),
  installationTimes: Yup.number().required('The Arrangement must be installed at least once').typeError('The Arrangement must be installed at least once').min(1), 
  arrangementLocation: Yup.string().required('Arrangement location is required').max(255, 'The location cannot be longet than 100 characters'),
  timesBilled: Yup.number().required().min(1)

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
  const [newArrangementStats, setNewArrangementStats] = useState(baseArrangementStats)

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
    const totalClientCost = newArrangementData.clientCost * newArrangementData.arrangementQuantity * newArrangementData.installationTimes * newArrangementData.timesBilled
    const individualFlowerBudget = newArrangementData.clientCost * (1 - projectData.profitmargin)
    const totalFlowerBudget = totalClientCost * (1-projectData.profitmargin)
    const totalProfit = totalClientCost - totalFlowerBudget

    setNewArrangementStats({
      totalClientCost,
      individualFlowerBudget,
      totalFlowerBudget,
      totalProfit,
    })
    
  }, [newArrangementData])

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
        arrangementQuantity: arrangementData.arrangementquantity,
        arrangementLocation: arrangementData.arrangementlocation,
        installationTimes: arrangementData.installationtimes,
        timesBilled: arrangementData.timesbilled
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
    <PopupBase 
      showPopup={showPopup}
      closePopup={handleClosePopup}>
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
        <div >
          <FormItem
            labelName="Location:"
            type="text"
            inputName="arrangementLocation"
            value={newArrangementData.arrangementLocation}
            handleChange={(e) => handleChange('arrangementLocation', e.target.value)}
            error={newArrangementErrors.arrangementLocation}
          />
        </div>
        <div>
          <FormItem
            labelName="Arrangement Quantity:"
            type="number"
            min={1}
            inputName="arrangementQuantity"
            value={newArrangementData.arrangementQuantity}
            handleChange={(e) => handleChange('arrangementQuantity', e.target.value)}
            error={newArrangementErrors.arrangementQuantity}
            />
        </div>
        <div>
          <FormItem
            labelName="Client Cost:"
            type="number"
            min={0}
            inputName="clientCost"
            value={newArrangementData.clientCost}
            handleChange={(e) => handleChange('clientCost', e.target.value)}
            error={newArrangementErrors.clientCost}
            />
        </div>
        <div>
          <FormItem
              labelName="Quantity of Weeks per Billing Period:"
              type="number"
              min={1}
              inputName="installationTimes"
              value={newArrangementData.installationTimes}
              handleChange={(e) => handleChange('installationTimes', e.target.value)}
              error={newArrangementErrors.arrangementQuantity}
            />
        </div>
        <div>
          <FormItem
              labelName="Installation Quantity per Week:"
              type="number"
              min={1}
              inputName="timesBilled"
              value={newArrangementData.timesBilled}
              handleChange={(e) => handleChange('timesBilled', e.target.value)}
              error={newArrangementErrors.timesBilled}
            />
        </div>
        
      </div>
      <div className='text-start mt-2'>
        <p>Total client cost: {toCurrency(newArrangementStats.totalClientCost)}</p>
        <p>Individual flower budget: {toCurrency(newArrangementStats.individualFlowerBudget)}</p>
        <p>Total flower budget: {toCurrency(newArrangementStats.totalFlowerBudget)}</p>
        <p>Total profit: {toCurrency(newArrangementStats.totalProfit)}</p>
      </div>
      
      <div className='butons-holder'>
        <button onClick={handleClosePopup}className='buton-secondary'>Close</button>
        <button onClick={saveChanges} className='buton-main '>Submit</button>
      </div>
    </PopupBase>
  )
}
