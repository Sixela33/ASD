import React, { useEffect, useState } from 'react'
import FormItem from '../Form/FormItem'
import * as Yup from 'yup';
import PopupBase from '../PopupBase';


const baseAditionalExpense = {
    description: '',
    clientcost: '',
    ammount: ''
}

const baseExpenseSchema = Yup.object().shape({
    description: Yup.string('The description is required').required('The description is required').max(255, 'The description exceeds the maximum length').typeError('The description is required') ,
    clientcost: Yup.number('The cost of the service is required').required('The cost of the service is required').min(0, 'The cost cannot be lower than 0').typeError('The cost of the service is required'),
    ammount: Yup.number('The quantity of the service is required').required('The quantity of the service is required').min(0, 'The quantity cannot be lower than 0').typeError('The quantity of the service is required')
});


export default function AddAditionalExpensePopup({showPopup, closePopup, submitFunc, projectData, editExpense}) {
    const [aditionalExpenseData, setAditionallExpenseData] = useState(baseAditionalExpense)
    const [formErrors, setFormErorrs] = useState({})
    const [editing, setIsEditing] = useState(false)

    const BeforeClosing = () => {
        setIsEditing(false)
        closePopup()
        setFormErorrs({})
    }

    const handleDataChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target;
        setAditionallExpenseData({
          ...aditionalExpenseData,
          [name]: value,
        });
    };

    const handleSubmit = async () => {
        let schemaErrors = null
        try {
            await baseExpenseSchema.validateSync(aditionalExpenseData, { abortEarly: false })
        } catch (err) {
            let temp = {}
            err.inner.forEach(error => {
                temp[error.path] = error.message;
            });
            schemaErrors = temp
        }

        if(schemaErrors) {
            setFormErorrs(schemaErrors)
            return
        }

        submitFunc(aditionalExpenseData)
        setAditionallExpenseData(baseAditionalExpense)
        BeforeClosing()
    }

    const handleClose = () => {
        setAditionallExpenseData(baseAditionalExpense)
        BeforeClosing()
    }
    
    useEffect(() => {
        if(editExpense) {
            setIsEditing(true)
            setAditionallExpenseData(editExpense)
        } else {
            setAditionallExpenseData(baseAditionalExpense)
            setIsEditing(false)
        }
    }, [editExpense])

    return (
        <PopupBase 
            showPopup={showPopup}
            closePopup={handleClose}>
            <h2>{!editing ? 'Add new expense' : 'Edit expense'}</h2>
            <FormItem labelName='Description:' type='text' inputName='description' value={aditionalExpenseData.description} handleChange={handleDataChange} error={formErrors.description}/>
            <FormItem labelName='Client cost:' type='number' inputName='clientcost' value={aditionalExpenseData.clientcost} handleChange={handleDataChange} error={formErrors.clientcost}/>
            <FormItem labelName='Quantity:' type='number' inputName='ammount' value={aditionalExpenseData.ammount} handleChange={handleDataChange} error={formErrors.ammount}/>
            <div className='buttons-holder'>
                <button onClick={handleClose} className='buton-secondary'>Cancel</button>
                <button onClick={handleSubmit} className='buton-main'>Confirm</button>
            </div>
        </PopupBase>
    )
}
