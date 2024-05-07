import React, { useEffect, useState } from 'react'
import useAlert from '../hooks/useAlert';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';
import PopupBase from './PopupBase';
import LoadingPopup from './LoadingPopup';
import SearchableDropdown from './Dropdowns/SearchableDropdown';

const CREATE_FLOWER_URL = '/api/flowers';
const EDIT_FLOWER_URL = '/api/flowers/edit';
const GET_FLOWER_COLORS_URL = '/api/flowers/flowerColors'

const defaultFormData = {
  flower: null,
  name: '',
  color: '',
}

export default function NewFlowerForm({showPopup, cancelButton, refreshData, flowerToEdit}) {
    if(!refreshData) refreshData = () => {}

    const axiosPrivate = useAxiosPrivateImage()
    const { setMessage } = useAlert()

    const [formData, setFormData] = useState(defaultFormData)
    const [isSubmitting, setIsSubmitting] = useState(false) // State to track if form is being submitted
    const [flowerColorList, setFlowerColorList] = useState([])

    useEffect(() => {
      if(flowerToEdit) {
        setFormData({
          flower: null,
          name: flowerToEdit.flowername,
          color: flowerToEdit.flowercolor,
        })
      }
    }, [flowerToEdit])

    const fetchFlowerColors = async () => {
      try {
        const response = await axiosPrivate.get(GET_FLOWER_COLORS_URL)
        console.log(response)
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

      console.log(formData.color)
      if(!formData.color.flowercolor || formData.color.flowercolor == '') {
        setMessage("A color must be assigned")
        return
      }

      setIsSubmitting(true) 
      
      try {
          const formDataToSend = new FormData()
          formDataToSend.append('name', formData.name)
          formDataToSend.append('color', formData.color.flowercolor)
          formDataToSend.append('flower', formData.flower) 

          if(flowerToEdit) {
            formDataToSend.append('prevFlowerPath', flowerToEdit.flowerimage) 
            formDataToSend.append('id', flowerToEdit.flowerid) 
    
            await axiosPrivate.patch(EDIT_FLOWER_URL, formDataToSend)
            setMessage("Flower Edited succesfully", false)
            refreshData()
          } else {
            await axiosPrivate.post(CREATE_FLOWER_URL, formDataToSend)
            setMessage("Flower Added succesfully", false)
          }
  
          setFormData(defaultFormData)
          cancelButton(true)

      } catch (error) {
          setMessage(error.response?.data, true)
          console.log(error)
      } finally {
        setIsSubmitting(false)
      }
    }
  
    const handleCancel = () => {
      setFormData(defaultFormData)
      cancelButton()

    }

  return (
    <PopupBase showPopup={showPopup}>
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

        <div className="flex flex-col mb-4 w-full">
            <label className="mb-1">Color:</label>
            <SearchableDropdown 
              options={flowerColorList}
              label={'flowercolor'}
              selectedVal={formData.color}
              handleChange={(e) => handleChange({target: {name:'color', value: e}})}
              placeholderText={'color'}
              />
        </div>
        <div className='buttons-holder w-full'>
          <button className='buton-secondary' onClick={handleCancel}>Cancel</button>
          <button className='buton-main' onClick={handleSubmit}>{'Add Flower'}</button>
        </div>
      </div>
    </PopupBase>

  )
}
