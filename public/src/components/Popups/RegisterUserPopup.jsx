import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import PopupBase from '../PopupBase';
import FormError from '../Form/FormError';

const REGISTER_URL = '/api/users/register';

const schema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
  .matches(/^(?=.*[A-Z])/, 'Must contain at least one uppercase character')
  .matches(/^(?=.*[0-9])/, 'Must contain at least one number'),
  password2: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

export default function RegisterUserPopup({ showPopup, closePopup, continueSubmit }) {
  const axiosPrivate = useAxiosPrivate();
  const { setMessage } = useAlert();
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const handleSubmitToBackend = async (userData) => {
    try {
      const response = await axiosPrivate.post(REGISTER_URL, userData);
      setMessage(response.data, false);
      if (continueSubmit) continueSubmit();
    } catch (error) {
      setMessage(error.response?.data, true);
    }
  };

  const closePopupHere = () => {
    closePopup();
  };

  return (
    <PopupBase showPopup={showPopup} closePopup={closePopupHere}>
      <div className="p-8">
        <h2>Create new user</h2>
        <form onSubmit={handleSubmit(handleSubmitToBackend)}>
          <div className="mb-4">
            <label className="block">Email:</label>
            <input type="text" {...register('email')} />
            <FormError error={errors.email?.message}/>
          </div>
          <div className="mb-4">
            <label className="block">Username:</label>
            <input type="text" {...register('username')} />
            <FormError error={errors.username?.message}/>
          </div>
          <div className="mb-4">
            <label className="block">Password:</label>
            <input type="password" {...register('password')} />
            <FormError error={errors.password?.message}/>

          </div>
          <div className="mb-4">
            <label className="block">Repeat Password:</label>
            <input type="password" {...register('password2')} />
            <FormError error={errors.password2?.message}/>

          </div>
          <div className='buttons-holder'>
            <button className='buton-main' onClick={closePopup}>Cancel</button>
            <button className='buton-secondary' type='submit'>Save</button>
          </div>
        </form>
      </div>
    </PopupBase>
  );
}
