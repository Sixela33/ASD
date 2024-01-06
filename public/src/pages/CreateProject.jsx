import React, { useState } from 'react';
import ArrangementPopup from '../components/ArrangementPopup';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const CREATE_PROJET_URL = '/api/projects/create';


export default function CreateProject() {

  const axiosPrivate = useAxiosPrivate();

  // form data
  const [projectClient, setProjectClient] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [projectContact, setProjectContact] = useState('');
  const [employeeBudget, setEmployeeBudget] = useState('');

  // floral arrangement creation variables
  const [arrangementsList, setArrangementsList] = useState([]);
  const [newArrangement, setNewArrangement] = useState({ arrangementType: '', arrangementDescription: '', flowerBudget: '', arrangementQuantity: ''});
  const [showArrangementPopup, setShowArrangementPopup] = useState(false);

  const [totalFlowerBudget, setTotalFlowerBudget] = useState(0);
 
  

  // adds the arrangement to the arrangements array and resets the values
  const addArrangement = () => {

    if (newArrangement.index != null){
      const index = newArrangement.index
      delete newArrangement.index
      const updatedArrangementsList = [...arrangementsList];
      updatedArrangementsList[index] = { ...newArrangement };
      setArrangementsList(updatedArrangementsList);
      //aqui quiero que se reemplace el objeto en arrangementList en el indice por el que recibe ahoita

    }else {
      setArrangementsList([...arrangementsList, { ...newArrangement }]);
    }
    setNewArrangement({
      arrangementType: '',
      arrangementDescription: '',
      flowerBudget: '',
      arrangementQuantity: '',
    });
    setTotalFlowerBudget(0)
    arrangementsList.map(arrang => {
      setTotalFlowerBudget(totalFlowerBudget + arrang.flowerBudget)
    } )

    setShowArrangementPopup(false);
  };

  const handleArrangementSubmit = (e) => {
    e.preventDefault();
    addArrangement();
  };

  const handleInputChange = (field, value) => {
    setNewArrangement({ ...newArrangement, [field]: value });
  };

  // resets the arrangement values and closes the popup
  const closePopup = () => {
    setNewArrangement({
      arrangementType: '',
      arrangementDescription: '',
      flowerBudget: '',
      arrangementQuantity: '',
    })
    setShowArrangementPopup(false)
  }

  const handleEdit = (index) => {
    console.log(index)
    setNewArrangement({...arrangementsList[index], index: index})
    setShowArrangementPopup(true)
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosPrivate.post(CREATE_PROJET_URL, JSON.stringify({
        projectDescription: projectDescription, 
        projectDate: projectDate, 
        projectContact:projectContact, 
        empoyeeBudget: employeeBudget, 
        arrangements: arrangementsList
      }))
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing form fields */}
        <div>
          <label>Client: </label>
          <input type="text" value={projectClient} onChange={(e) => setProjectClient(e.target.value)}/>
        </div>
        <div>
          <label>Project Description: </label>
          <input type="text" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)}/>
        </div>
        <div>
          <label>Project Date: </label>
          <input type="date" value={projectDate} onChange={(e) => setProjectDate(e.target.value)}/>
        </div>
        <div>
          <label>Project Contact: </label>
          <input type="text" value={projectContact} onChange={(e) => setProjectContact(e.target.value)}/>
        </div>
        <div>
          <label>Employee Budget: </label>
          <input type="text" value={employeeBudget} onChange={(e) => setEmployeeBudget(e.target.value)}/>
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
                  <td className="py-2 px-4">{arrangement.arrangementBudget}</td>
                  <td className="py-2 px-4">{arrangement.arrangementQuantity}</td>
                  <td className="py-2 px-4">{arrangement.arrangementBudget +(arrangement.arrangementBudget * 0.3)}</td>
                </tr>

              ))}
              <tr>
              <td>{totalFlowerBudget}</td>
              <td>{totalFlowerBudget + (totalFlowerBudget + totalFlowerBudget * 0.3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Button to open popup for adding a new arrangement */}
        <button type="button" onClick={() => setShowArrangementPopup(true)} className="bg-gray-500 text-white px-4 py-2 rounded focus:outline-none">Add New Arrangement</button>
        <br/>
        {/* Popup for adding a new arrangement */}
        <ArrangementPopup showPopup={showArrangementPopup} onClose={closePopup} onSubmit={handleArrangementSubmit} newArrangement={newArrangement} onInputChange={handleInputChange}/>

        <button type="submit" className="bg-black text-white px-4 py-2 rounded focus:outline-none">Save Project</button>
      </form>
    </div>
  );
}
