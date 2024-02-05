import React, { useState } from 'react';
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage';
import useAlert from '../../hooks/useAlert';
import { Link } from 'react-router-dom';

const CREATE_FLOWER_URL = '/api/flowers';

export default function LoadFlower() {
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
        formDataToSend.append('flower', formData.flower); // Change 'image' to 'flower'

        const response = await axiosPrivate.post(CREATE_FLOWER_URL, formDataToSend);

        setMessage("Flower Added succesfully", false)
    } catch (error) {
        setMessage(error.response?.data, true)
        console.log(error);
    }
  }
  

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-md shadow-md">
      <Link to="/flowers" className='mt-4 text-blue-500 hover:text-blue-700'>go back</Link>
      <h2 className="text-2xl font-bold mb-4 text-center">Add Flower</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded">Add Flower</button>
      </form>
    </div>
  );
}
