import React, { useState } from 'react'
import useAlert from '../hooks/useAlert';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';
import PopupBase from './PopupBase';

const CREATE_FLOWER_URL = '/api/flowers';
const EDIT_FLOWER_URL = '/api/flowers/edit';

export default function NewFlowerForm({showPopup, cancelButton, refreshData, flowerToEdit, title}) {
    if(!refreshData) refreshData = () => {}

    const axiosPrivate = useAxiosPrivateImage();
    const { setMessage } = useAlert()

    const [formData, setFormData] = useState({
      flower: null,
      name: '',
      color: '',
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        flower: file,
      });
    };

    useState(() => {
      if(flowerToEdit) {
        setFormData({
          flower: null,
          name: flowerToEdit.flowername,
          color: flowerToEdit.flowercolor,
        })
      }
    }, [flowerToEdit])
    
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.name);
          formDataToSend.append('color', formData.color);
          formDataToSend.append('flower', formData.flower); 

          if(flowerToEdit) {
            formDataToSend.append('prevFlowerPath', flowerToEdit.flowerimage); 
            formDataToSend.append('id', flowerToEdit.flowerid); 
    
            const response = await axiosPrivate.patch(EDIT_FLOWER_URL, formDataToSend);
            setMessage("Flower Edited succesfully", false)
            refreshData()
          } else {
            const response = await axiosPrivate.post(CREATE_FLOWER_URL, formDataToSend);
            setMessage("Flower Added succesfully", false)
          }
  
          cancelButton()
      } catch (error) {
          setMessage(error.response?.data, true)
          console.log(error);
      }
    }

  return (
    <PopupBase showPopup={showPopup}>
      <h2 className='mb-4'>{title}</h2>
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
            <input className='w-full' type="text" name="color" value={formData.color} onChange={handleChange} required/>
        </div>
        <div className='buttons-holder '>
          <button className='buton-secondary' onClick={cancelButton}>Cancel</button>
          <button className='buton-main' onClick={handleSubmit}>Add Flower</button>
        </div>
      </div>
    </PopupBase>

  )
}
