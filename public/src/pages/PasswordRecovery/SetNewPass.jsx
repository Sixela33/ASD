import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import * as Yup from 'yup';
import FormError from '../../components/Form/FormError';

const baseValues = { password1: '', password2: '' }
const CHANGE_PASSWORD_URL = '/api/users/passwordRecovery'

const passwordSchema = Yup.object().shape({
    password1: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[A-Z])/, 'Must contain at least one uppercase character')
    .matches(/^(?=.*[0-9])/, 'Must contain at least one number'),
    password2: Yup.string().oneOf([Yup.ref('password1'), null], 'Passwords must match')
})

export default function SetNewPass() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()
    const { id, code } = useParams()

    const [passwords, setPasswords] = useState(baseValues)
    const [formErrors, setFormErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const sendPasswordChange = async () => {
        let schemaErrors = null
        try {
            await passwordSchema.validate(passwords, { abortEarly: false })
        } catch (err) {
            let temp = {}
            err.inner.forEach(error => {
                temp[error.path] = error.message;
            });
            schemaErrors = temp
        }

        if(schemaErrors) {
            setFormErrors(schemaErrors)
            return
        }

        
        try {
            const dataPackage = {
                password: passwords.password2,
                code: code,
                id: id
            }

            const response = await axiosPrivate.post(CHANGE_PASSWORD_URL, JSON.stringify(dataPackage))
        } catch (error) {
            setMessage(error.response?.data);
        }
    }

    return (
        <div className=' container mx-auto mt-[20vh] flex flex-col items-center justify-center space-y-2'>
            <h1 className='my-3'>Set new Email</h1>
            <label>Password: </label>
            <input className='w-1/4' type='password' name='password1' value={passwords.password1} onChange={handleChange}/>
            <FormError error={formErrors.password1}/>

            <label>Repeat Password: </label>
            <input className='w-1/4' type='password' name='password2' value={passwords.password2} onChange={handleChange}/>
            <FormError error={formErrors.password2}/>

            <button className='buton-main' onClick={sendPasswordChange}>Submit</button>
        </div>
    )
}
