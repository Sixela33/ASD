import React, { useEffect, useState } from 'react'
import useAlert from '../hooks/useAlert';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';
import PopupBase from './PopupBase';
import LoadingPopup from './LoadingPopup';
import MultipleFlowerColorSelector from './MultipleFlowerColorSelector';
import AddColorPupup from './Popups/AddColorPupup';
import NumberInputWithNoScroll from './NumberInputWithNoScroll';

const CREATE_FLOWER_URL = '/api/flowers';
const EDIT_FLOWER_URL = '/api/flowers/edit';
const GET_FLOWER_COLORS_URL = '/api/flowers/colors'
const GET_SEASONS = '/api/flowers/seasons'

const defaultFormData = {
  flower: null,
  name: '',
  color: [],
  initialPrice: '',
  clientName: '',
  seasons: []
}

export default function NewFlowerForm({showPopup, cancelButton, refreshData, flowerToEdit}) {
    if(!refreshData) refreshData = () => {}

    const axiosPrivate = useAxiosPrivateImage()
    const { setMessage } = useAlert()

    const [formData, setFormData] = useState(defaultFormData)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [flowerColorList, setFlowerColorList] = useState([])
    const [showNewColorPopup, setNewColorPopup] = useState(false)
    const [flowerSeasons, setFlowerSeasons] = useState([])
    const [imagePreview, setImagePreview] = useState(null);

    const fetchFlowerColors = async () => {
      try {
        const response = await axiosPrivate.get(GET_FLOWER_COLORS_URL)
        setFlowerColorList(response.data)
      } catch (error) {
        console.log(error)
      }
    }

    const fetchFlowerSeasons = async () => {
      try {
          const response = await axiosPrivate.get(GET_SEASONS)
          setFlowerSeasons(response.data)
      } catch (error) {
          setMessage(error.response.data, true)
      }
    }

    useEffect(() => {
      fetchFlowerColors()
      fetchFlowerSeasons()
    }, [])

    const handleChange = (e) => {
      const { name, value } = e.target

      setFormData({
        ...formData,
        [name]: value,
      })
    }

    useEffect(() => {
      
      if (flowerToEdit) {
        setFormData({
          flower: defaultFormData.flower,
          name: flowerToEdit.flowername,
          color: flowerToEdit.flowercolors,
          initialPrice: flowerToEdit.initialprice || '',
          clientName: flowerToEdit.clientname,
          seasons: flowerToEdit.seasons,
        })
      }

    }, [flowerToEdit, flowerColorList])
  
    const handleImageChange = (e) => {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        flower: file,
      })

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
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
        formDataToSend.append('clientName', formData.clientName) 

        for (var i = 0; i < formData.color.length; i++) {
          formDataToSend.append('colors[]', formData.color[i].colorid)
        }

        for (var i = 0; i < formData.seasons.length; i++) {
          formDataToSend.append('seasons[]', formData.seasons[i].seasonsid)
        }
        
        if(flowerToEdit) {
          formDataToSend.append('prevFlowerPath', flowerToEdit.flowerimage) 
          formDataToSend.append('id', flowerToEdit.flowerid) 
  
          await axiosPrivate.patch(EDIT_FLOWER_URL, formDataToSend)
          setMessage("Flower Edited succesfully", false)
        } else {
          const response = await axiosPrivate.post(CREATE_FLOWER_URL, formDataToSend)
          setMessage("Flower Added succesfully", false)
        }

        await refreshData()
        setFormData(defaultFormData)
        setImagePreview()
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
      setImagePreview()
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
      closePopup={handleCancel}
      maxw={'[50%]'}>
      <AddColorPupup
        showPopup={showNewColorPopup}
        closePopup={(shouldrefresh) => closeNewColorPopup(shouldrefresh)}
      ></AddColorPupup>
      <LoadingPopup showPopup={isSubmitting}>
        <h1>Loading Flower</h1>
        <p>Please wait</p>
      </LoadingPopup>
      <h2 className="mb-4">Add Flower</h2>
    <div className="w-3/4 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col mb-4">
          <label className="mb-1">Image:</label>
          <input
            className="w-full"
            type="file"
            name="flower"
            onChange={handleImageChange}
            required
          />
          <div className="mt-4">
              {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto"
                  />
                )}
            </div>
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1">Initial price:</label>
          <NumberInputWithNoScroll
            className="w-full"
            type="number"
            min={0}
            name="initialPrice"
            value={formData.initialPrice}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="mb-1">Internal Name:</label>
          <input
            className="w-full"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="mb-1">Client Name:</label>
          <input
            className="w-full"
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
          />
        </div>

        <div>

        {flowerColorList && (
          <div className="flex flex-col mb-4">
            <label className="mb-1">Color:</label>
            <MultipleFlowerColorSelector
              options={flowerColorList}
              selectedColors={formData.color}
              setSelectedColors={(newValues) =>
                handleChange({ target: { name: "color", value: newValues } })
              }
              isListBelow={true}
              placeholderText={"Add a color"}
            />
          </div>
        )}
        <button className="go-back-button mb-4 md:mb-0" onClick={() => setNewColorPopup(true)}>Add new color</button>
        </div>

        {flowerSeasons && (
          <div className="flex flex-col mb-4">
            <label className="mb-1">Seasons:</label>
            <MultipleFlowerColorSelector
              options={flowerSeasons}
              selectedColors={formData.seasons}
              setSelectedColors={(newValues) =>
                handleChange({ target: { name: "seasons", value: newValues } })
              }
              isListBelow={true}
              label={"seasonname"}
              placeholderText={"Add a season"}
            />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <button className="buton-secondary" onClick={handleCancel}>Cancel</button>
        <button className="buton-main" onClick={handleSubmit}>Add Flower</button>
      </div>
    </div>
    </PopupBase>

  )
}
