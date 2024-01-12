import React, { useState, useEffect } from 'react'
import { validateEmail, validatePassword } from '../utls/utils';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAlert from '../hooks/useAlert';
import { Link } from 'react-router-dom';

const REGISTER_URL = '/api/users/register'

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const axiosPrivate = useAxiosPrivate();
  const { setMessage } = useAlert()

  useEffect(() => {
    setError('')
  }, [username, password, password2, email])

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateEmail(email) || !validatePassword(password)) {
        setError('Invalid email or password. Please check and try again.');
        return;
      }

      if(password != password2){
        setError('Passwords do not match')
        return
      }

      try {
        const response = await axiosPrivate.post(REGISTER_URL, JSON.stringify({email, username, password}))
        console.log(response)
        setMessage(response.data, false)
        setEmail("")
        setPassword("")
        setPassword2("")
        setUsername("")
        
        
      } catch (error) {
        console.log("[ERROR]: \n", error)
        setMessage(error.response?.data, true)
      }

  };

  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 ">
          <Link to="/admin" className='mt-4 text-blue-500 hover:text-blue-700'>go back</Link>
          <h2 className="text-3xl font-bold text-center mb-4">Create new user</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-lg mb-1">Email:</label>
              <input className="w-full px-4 py-3 bg-gray-300 rounded-md text-lg focus:outline-none focus:border-blue-400 " type="text" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-1">Username:</label>
              <input className="w-full px-4 py-3 bg-gray-300 rounded-md text-lg focus:outline-none focus:border-blue-400 " type="text" value={username} onChange={(e) => setUsername(e.target.value)} required/>
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-1">Password:</label>
              <input className="w-full px-4 py-3 bg-gray-300 rounded-md text-lg focus:outline-none focus:border-blue-400" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-1">Repeat Password:</label>
              <input className="w-full px-4 py-3 bg-gray-300 rounded-md text-lg focus:outline-none focus:border-blue-400" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required/>
            </div>
            <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-400 focus:outline-none focus:border-none" type="submit">Create user</button>
          </form>
      </div>
    </div>
  );
}
