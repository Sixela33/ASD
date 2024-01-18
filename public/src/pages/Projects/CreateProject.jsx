import React, { useEffect, useState } from 'react';
import ArrangementPopup from '../../components/ArrangementPopup';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { Link } from 'react-router-dom';
const CREATE_PROJET_URL = '/api/projects/create';
const PROFIT_MARGIN = 0.3

export default function CreateProject() {

  const axiosPrivate = useAxiosPrivate()
  const {setMessage} = useAlert()

  // form data
  const [projectClient, setProjectClient] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectDate, setProjectDate] = useState('')
  const [projectContact, setProjectContact] = useState('')
  const [staffBudget, setstaffBudget] = useState('')

  const emptyArrangement = { arrangementType: '', arrangementDescription: '', flowerBudget: '', arrangementQuantity: ''}

  // floral arrangement creation variables
  const [arrangementsList, setArrangementsList] = useState([])
  const [newArrangement, setNewArrangement] = useState(emptyArrangement)
  const [showArrangementPopup, setShowArrangementPopup] = useState(false)

  const [totalFlowerBudget, setTotalFlowerBudget] = useState(0)

  useEffect(() => {
    // reduce loops through the wole array and keeps track of the value "accumulator" it returns the result
    const sum = arrangementsList.reduce(
      (accumulator, arrang) => accumulator + arrang.flowerBudget * arrang.arrangementQuantity, 0 );
    setTotalFlowerBudget(sum);
  }, [arrangementsList])

  // adds the arrangement to the arrangements array and resets the values
  const addArrangement = async (e) => {
    e.preventDefault()

    if (newArrangement.index != null){
      const index = newArrangement.index
      delete newArrangement.index
      const updatedArrangementsList = [...arrangementsList]
      updatedArrangementsList[index] = { ...newArrangement }
      setArrangementsList(updatedArrangementsList)
      //aqui quiero que se reemplace el objeto en arrangementList en el indice por el que recibe ahoita

    }else {
      console.log(newArrangement)
      setArrangementsList([...arrangementsList, { ...newArrangement }])
    }
    setNewArrangement(emptyArrangement)
    setShowArrangementPopup(false)

  }
  const handleInputChange = (field, value) => {
    setNewArrangement({ ...newArrangement, [field]: value })
  }
  // resets the arrangement values and closes the popup
  const closePopup = () => {
    setNewArrangement(emptyArrangement)
    setShowArrangementPopup(false)
  }

  const handleEdit = (index) => {
    // I add an index to the object, this is used to replace the existing values in the array
    setNewArrangement({...arrangementsList[index], index: index})
    setShowArrangementPopup(true)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if ( !projectClient || !projectDescription || !projectDate || !projectContact || !staffBudget) {
      setMessage('Please fill in all the required fields.', true)
      return
    }
    try {
      const response = await axiosPrivate.post(CREATE_PROJET_URL, JSON.stringify({
        staffBudget, 
        projectContact, 
        projectDate, 
        projectDescription, 
        projectClient, 
        profitMargin: PROFIT_MARGIN,
        arrangements: arrangementsList
      }))
      // reseting input form (I do not redirect in case that admin wants to keep creating)
      setMessage("Project created Succesfully", false)
      // setProjectClient("")
      // setProjectDescription("")
      // setProjectDate("")
      // setProjectContact("")
      // setstaffBudget("")
      // setArrangementsList([])
      // setNewArrangement(emptyArrangement)
      
      // console.log(response)
    } catch (error) {
      console.log(error)
      setMessage(error.response?.data, true)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
    <Link to='/projects' className="mt-4 text-blue-500 hover:text-blue-700">go back</Link>

      <h2 className="text-2xl font-bold mb-4 text-center">Create Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col mb-4">
          <label className="mb-1">Client:</label>
          <input type="text" value={projectClient} onChange={(e) => setProjectClient(e.target.value)} className="border border-gray-300 p-2 rounded" required/>
        </div>
        
        <div className="flex flex-col mb-4">
          <label className="mb-1">Project Description:</label>
          <input type="text" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} className="border border-gray-300 p-2 rounded" required/>
        </div>
        
        <div className="flex flex-col mb-4">
          <label className="mb-1">Project Date:</label>
          <input type="date" value={projectDate} onChange={(e) => setProjectDate(e.target.value)} className="border border-gray-300 p-2 rounded" required/>
        </div>
        
        <div className="flex flex-col mb-4">
          <label className="mb-1">Project Contact:</label>
          <input type="text" value={projectContact} onChange={(e) => setProjectContact(e.target.value)} className="border border-gray-300 p-2 rounded" required/>
        </div>
        
        <div className="flex flex-col mb-4">
          <label className="mb-1">Staff Budget:</label>
          <input type="number" value={staffBudget} onChange={(e) => setstaffBudget(e.target.value)} className="border border-gray-300 p-2 rounded" required/>
        </div>

        {/* Arrangements section */}
        <div className="bg-gray-200 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Arrangements</h3>
        <table className="min-w-full border border-gray-300 bg-white">
            <thead >
              <tr>
                <th className="py-2 px-4">Arrangement type</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Flower budget</th>
                <th className="py-2 px-4">Quantity</th>
                <th className="py-2 px-4">Client cost</th>
              </tr>
            </thead>
            <tbody>
              {arrangementsList.map((arrangement, index) => (

                <tr key={index} className='bg-gray-300' onClick={() => handleEdit(index)}>
                  <td className="py-2 px-4">{arrangement.arrangementType}</td>
                  <td className="py-2 px-4">{arrangement.arrangementDescription}</td>
                  <td className="py-2 px-4">{arrangement.flowerBudget}</td>
                  <td className="py-2 px-4">{arrangement.arrangementQuantity}</td>

                  <td className="py-2 px-4">{(arrangement.flowerBudget * arrangement.arrangementQuantity) + (arrangement.flowerBudget * arrangement.arrangementQuantity * PROFIT_MARGIN)}</td>
                </tr>

              ))}
              <tr>
              <td>TOTAL flower budget: </td>
              <td>{totalFlowerBudget}</td>
              <td>TOTAL client cost: </td>
              <td>{totalFlowerBudget + (totalFlowerBudget * 0.3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button type="button" onClick={() => setShowArrangementPopup(true)} className="bg-gray-500 text-white px-4 py-2 rounded focus:outline-none mb-4">Add New Arrangement</button>

        <ArrangementPopup showPopup={showArrangementPopup} onClose={closePopup} onSubmit={addArrangement} newArrangement={newArrangement} onInputChange={handleInputChange}/>

        <button type="submit" className="bg-black text-white px-4 py-2 rounded focus:outline-none">Save Project</button>
        </form>
    </div>
  )
}
