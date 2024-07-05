import React, { useEffect, useState } from 'react'
import useAlert from '../hooks/useAlert';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';
import PopupBase from './PopupBase';
import LoadingPopup from './LoadingPopup';
import MultipleFlowerColorSelector from './MultipleFlowerColorSelector';
import AddColorPupup from './Popups/AddColorPupup';

const CREATE_FLOWER_URL = '/api/flowers';
const EDIT_FLOWER_URL = '/api/flowers/edit';
const GET_FLOWER_COLORS_URL = '/api/flowers/colors'

const defaultFormData = {
  flower: null,
  name: '',
  color: [],
  initialPrice: ''
}

export default function NewFlowerForm({showPopup, cancelButton, refreshData, flowerToEdit}) {
    if(!refreshData) refreshData = () => {}

    const axiosPrivate = useAxiosPrivateImage()
    const { setMessage } = useAlert()

    const [formData, setFormData] = useState(defaultFormData)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [flowerColorList, setFlowerColorList] = useState([])
    const [showNewColorPopup, setNewColorPopup] = useState(false)

    const fetchFlowerColors = async () => {
      try {
        const response = await axiosPrivate.get(GET_FLOWER_COLORS_URL)
        setFlowerColorList(response.data)
      } catch (error) {
        console.log(error)
      }
    }

    useEffect(() => {
      fetchFlowerColors()
    }, [])

    const handleChange = (e) => {
      const { name, value } = e.target

      setFormData({
        ...formData,
        [name]: value,
      })
    }

    useEffect(() => {

      if(flowerToEdit?.flowercolors && flowerColorList) {
        let temp = []

        for(let i = 0; i < flowerToEdit.colorids.length; i++){
          const flowerPos = flowerColorList.findIndex(item => item.colorname == flowerToEdit.flowercolors[i])
          temp.push(flowerColorList[flowerPos])
        }

        setFormData({
          flower: defaultFormData.flower,
          name: flowerToEdit.flowername,
          color: temp,
          initialPrice: flowerToEdit.initialprice || ''
        })
        
      }
    }, [flowerToEdit, flowerColorList])
  
    const handleImageChange = (e) => {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        flower: file,
      })
    }
    
    const handleSubmit = async (e) => {
      e.preventDefault()

      if(isSubmitting) return

      if (formData.name == '') {
        setMessage("Flower name cannot me empty")
        return
      }

      if(!formData.color.length > 0) {
        setMessage("at least 1 color must be assigned")
        return
      }

      setIsSubmitting(true) 
      try {
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name)
        formDataToSend.append('flower', formData.flower) 
        formDataToSend.append('initialPrice', formData.initialPrice) 

        for (var i = 0; i < formData.color.length; i++) {
          formDataToSend.append('colors[]', formData.color[i].colorid)
        }

        let newFlowerData
        
        if(flowerToEdit) {
          formDataToSend.append('prevFlowerPath', flowerToEdit.flowerimage) 
          formDataToSend.append('id', flowerToEdit.flowerid) 
  
          await axiosPrivate.patch(EDIT_FLOWER_URL, formDataToSend)
          setMessage("Flower Edited succesfully", false)
        } else {
          const response = await axiosPrivate.post(CREATE_FLOWER_URL, formDataToSend)
          newFlowerData = response.data
          setMessage("Flower Added succesfully", false)
        }

        await refreshData()
        setFormData(defaultFormData)
        cancelButton()

      } catch (error) {
          setMessage(error.response?.data, true)
          console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    }
  
    const handleCancel = () => {
      setFormData(defaultFormData)
      cancelButton()

    }

    const closeNewColorPopup = (shouldrefresh) => {
      if (shouldrefresh) {
        fetchFlowerColors()
      }
      setNewColorPopup(false)
    }

  return (
    <PopupBase 
      showPopup={showPopup}
      closePopup={handleCancel}>
      <AddColorPupup
        showPopup={showNewColorPopup}
        closePopup={(shouldrefresh) => closeNewColorPopup(shouldrefresh)}
      ></AddColorPupup>
      <LoadingPopup showPopup={isSubmitting}>
        <h1>Loading Flower</h1>
        <p>Please wait</p>
      </LoadingPopup>
      <h2 className='mb-4'>Add Flower</h2>
      <div className="flex flex-col items-center w-3/4 mx-auto">
        <div className="flex flex-col mb-4 w-full">
            <label className="mb-1">Image:</label>
            <input className='w-full' type="file" name="flower" onChange={handleImageChange} required/>
        </div>

        <div className="flex flex-col mb-4 w-full ">
            <label className="mb-1">Name:</label>
            <input className='w-full' type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="flex flex-col mb-4 w-full ">
            <label className="mb-1">Initial price:</label>
            <input className='w-full' type="number" min={0} name="initialPrice" value={formData.initialPrice} onChange={handleChange}/>
        </div>

        <div className="flex flex-col mb-4 w-full">
            <label className="mb-1">Color:</label>
            <MultipleFlowerColorSelector
              options={flowerColorList}
              selectedColors = {formData.color}
              setSelectedColors = {(newValues) => handleChange({target: {name: 'color', value: newValues}})}
              isListBelow={true}
            />
        </div>
        <button className='go-back-button' onClick={()=>setNewColorPopup(true)}>add new color</button>
        <div className='buttons-holder w-full'>
          <button className='buton-secondary' onClick={handleCancel}>Cancel</button>
          <button className='buton-main' onClick={handleSubmit}>{'Add Flower'}</button>
        </div>
      </div>
    </PopupBase>

  )
}
