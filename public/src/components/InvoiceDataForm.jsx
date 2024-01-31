import React from 'react'

export default function InvoiceDataForm({ onSubmit, invoiceData, handleChange }) {
  return (
    <div>
        <h2 className="text-2xl font-bold mb-4 text-center">Invoice Data</h2>
        <form className="space-y-4">
          <div className="flex flex-col mb-4">
              <label className="mb-1">vendor:</label>
              <input type="text" name="vendor" value={invoiceData.vendor} onChange={handleChange} className="border border-gray-300 p-2 rounded" required/>
          </div>

          <div className="flex flex-col mb-4">
              <label className="mb-1">invoice Number:</label>
              <input type="text" name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleChange} className="border border-gray-300 p-2 rounded" required/>
          </div>

          <div className="flex flex-col mb-4">
              <label className="mb-1">Due Date:</label>
              <input type="date" name="dueDate" value={invoiceData.dueDate} onChange={handleChange} className="border border-gray-300 p-2 rounded" required/>
          </div>

          <div className="flex flex-col mb-4">
              <label className="mb-1">Invoice Ammount:</label>
              <input type="number" name="invoiceAmmount" value={invoiceData.invoiceAmmount} onChange={handleChange} className="border border-gray-300 p-2 rounded" required/>
          </div>


          <button onClick={onSubmit} className="bg-black text-white font-bold py-2 px-4 rounded">Continue</button>
        </form>
    </div>
  )
}

