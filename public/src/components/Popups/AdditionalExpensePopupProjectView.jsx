import React from 'react'
import AddAditionalExpensePopup from './AddAditionalExpensePopup.jsx'


export default function AdditionalExpensePopupProjectView({showPopup, closePopup, projectData, editExpense}) {

    return (
        <AddAditionalExpensePopup
            showPopup = {showPopup} 
            closePopup = {closePopup} 
            submitFunc = {handleSubmit}
            projectData = {projectData} 
            editExpense = {editExpense}
        />
    )
}
