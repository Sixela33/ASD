import React, { useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import FormError from '../../components/Form/FormError';
import * as Yup from 'yup';

const REQUEST_PASSWORD_CHANGE_URL = "/api/users/forgotPassword"

const emailSchema = Yup.string().email('Invalid email address').required('Email is required')

export default function InputEmail() {
  const axiosPrivate = useAxiosPrivate()
  const {setMessage} = useAlert()
  const [email, setEmail] = useState('')
  const [formErrors, setFormErrors] = useState({})
  
  const sendRequest = async () => {
    let schemaErrors = null

    try {
        await emailSchema.validate(email, { abortEarly: false })
    } catch (err) {
        let temp = {}
        console.log("err", err)
        err.inner.forEach(error => {
            temp['email'] = error.message;
        });
        schemaErrors = temp
    }

    if(schemaErrors) {
        setFormErrors(schemaErrors)
        return
    }

    try {

      console.log(email)
      const response = await axiosPrivate.post(REQUEST_PASSWORD_CHANGE_URL, JSON.stringify({email}))
      console.log(response.data)
      //setMessage(response.data)
    } catch (error) {
      setMessage(error.response?.data);
    }
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
  }

  return (
    <div className=' container mx-auto mt-[20vh] flex flex-col items-center justify-center space-y-2 '>
        <h1 className='my-3'>Recover your account</h1>
        <label >Email: </label>
        <input placeholder="example@example.com" className='w-1/4' value={email} type='email' onChange={handleChange} ></input>
        <FormError error={formErrors.email}/>
        <button className='buton-main w-1/4' onClick={sendRequest}>Send</button>
    </div>
  )
}
