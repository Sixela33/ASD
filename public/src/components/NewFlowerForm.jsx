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
    <div>
        <h2 className="text-2xl font-bold mb-4 text-center">Add Flower</h2>

        <form className="space-y-4">
            <div className="flex flex-col mb-4">
                <label className="mb-1">Image:</label>
                <input type="file" name="flower" onChange={handleImageChange} className="border border-gray-300 p-2 rounded" required/>
            </div>

            <div className="flex flex-col mb-4">
                <label className="mb-1">Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="border border-gray-300 p-2 rounded" required />
            </div>

            <div className="flex flex-col mb-4">
                <label className="mb-1">Color:</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="border border-gray-300 p-2 rounded" required/>
            </div>

            <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded" onClick={cancelButton}>Cancel</button>
            <button className="bg-black text-white font-bold py-2 px-4 rounded" onClick={handleSubmit}>Add Flower</button>
        </form>
    </div>
  )
}
