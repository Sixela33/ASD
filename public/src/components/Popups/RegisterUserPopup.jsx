import React, { useState } from 'react';
import {validateEmail, validatePassword} from '../../utls/utils'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import ConfirmationPopup from './ConfirmationPopup';

const REGISTER_URL = '/api/users/register';

const defaultUserData = { email: '', password: '', password2: '', username: '' };

export default function RegisterUserPopup({ showPopup, closePopup, continueSubmit }) {
  const [userData, setUserData] = useState(defaultUserData);
  const axiosPrivate = useAxiosPrivate();
  const { setMessage } = useAlert();

  const handleSubmit = async () => {

    if (!validateEmail(userData.email) || !validatePassword(userData.password)) {
      setMessage('Invalid email or password. Please check and try again.');
      return;
    }

    if (userData.password !== userData.password2) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axiosPrivate.post(REGISTER_URL, userData);
      setMessage(response.data, false);
      setUserData(defaultUserData);
      if(continueSubmit) continueSubmit()
    } catch (error) {
      // console.log("[ERROR]: \n", error);
      setMessage(error.response?.data, true);
    }
  };

  const handleChange = (field, value) => {
    setUserData((prevUserData) => ({ ...prevUserData, [field]: value }));
  };

  const closePopupHere = () => {
    setUserData(defaultUserData);
    closePopup();
  };

  const { email, username, password, password2 } = userData;

  return (
    <ConfirmationPopup showPopup={showPopup} closePopup={closePopupHere} confirm={handleSubmit}>
      <div className="p-8">
        <h2>Create new user</h2>
      
          <div className="mb-4">
            <label className="block">Email:</label>
            <input type="text" value={email} onChange={(e) => handleChange('email', e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block">Username:</label>
            <input type="text" value={username} onChange={(e) => handleChange('username', e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block">Password:</label>
            <input type="password" value={password} onChange={(e) => handleChange('password', e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block">Repeat Password:</label>
            <input type="password" value={password2} onChange={(e) => handleChange('password2', e.target.value)} required />
          </div>
       
      </div>
    </ConfirmationPopup>
  );
}
