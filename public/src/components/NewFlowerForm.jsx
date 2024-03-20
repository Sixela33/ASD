import React, { useState } from 'react'
import useAlert from '../hooks/useAlert';
import useAxiosPrivateImage from '../hooks/useAxiosPrivateImage';

const CREATE_FLOWER_URL = '/api/flowers';

export default function NewFlowerForm({cancelButton}) {

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
    
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.name);
          formDataToSend.append('color', formData.color);
          formDataToSend.append('flower', formData.flower); 
  
          const response = await axiosPrivate.post(CREATE_FLOWER_URL, formDataToSend);
  
          setMessage("Flower Added succesfully", false)
          cancelButton()
      } catch (error) {
          setMessage(error.response?.data, true)
          console.log(error);
      }
    }

  return (
    <div className='container mx-auto mt-8 p-4 text-center'>
        <h2 className='mb-4'>Add Flower</h2>
        <div className="flex flex-col items-center">
            <div className="flex flex-col mb-4 w-1/4">
                <label className="mb-1">Image:</label>
                <input className='w-full' type="file" name="flower" onChange={handleImageChange} required/>
            </div>

            <div className="flex flex-col mb-4 w-1/4">
                <label className="mb-1">Name:</label>
                <input className='w-full' type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="flex flex-col mb-4 w-1/4">
                <label className="mb-1">Color:</label>
                <input className='w-full' type="text" name="color" value={formData.color} onChange={handleChange} required/>
            </div>
            <div className='buttons-holder w-1/4'>
              <button className='buton-secondary' onClick={cancelButton}>Cancel</button>
              <button className='buton-main' onClick={handleSubmit}>Add Flower</button>
            </div>
        </div>
    </div>
  )
}
