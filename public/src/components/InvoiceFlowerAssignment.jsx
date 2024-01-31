import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useAlert from '../hooks/useAlert'
import { aggregateFlowerData } from '../utls/aggregateFlowerDataInvoices'

const ARRANGEMENT_DATA_FETCH = '/api/projects/flowers'
const GET_PROJECTS_URL = '/api/projects/manyByID';
const ADD_INVOICE_URL = '/api/invoices'

export default function InvoiceFlowerAssignment({goBack, chosenProjects}) {

  const [flowerData, setFlowerData] = useState([])
  const [displayFlowerData, setDisplayFlowerData] = useState([])
  const [selectedRow, setSelectedRow] = useState(0)
  const [projectsInfo, setProjectsInfo] = useState([])
  
  const [flowerPriceTracker, setFlowerPriceTracker] = useState([])

  const axiosPrivate = useAxiosPrivate();
  const { setMessage } = useAlert();

  const fetchData = async () => {
    try {

      const projects = await axiosPrivate.post(GET_PROJECTS_URL, JSON.stringify({ids: chosenProjects}))
      setProjectsInfo(projects?.data)

      const response = await axiosPrivate.post(ARRANGEMENT_DATA_FETCH, JSON.stringify({ids: chosenProjects}))
      setFlowerData(response?.data)

    } catch (error) {
      setMessage(error.response?.data?.message, true);
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
      
    const {aggregatedFlowerArray, aggregatedUniqueFlowers} = aggregateFlowerData(flowerData)

    setFlowerPriceTracker(aggregatedUniqueFlowers)
    setDisplayFlowerData(aggregatedFlowerArray)

  }, [flowerData])
  
  const changeFlowerUnitPrice = (e, flowerID) => {
      e.preventDefault()
      // I find the index fo the flower id 
      const existingFlowerIndex = flowerPriceTracker.findIndex(item => item.flowerid === flowerID)
      

      if (existingFlowerIndex !== -1) {
          const updatedFlowerPriceTracker = [...flowerPriceTracker]

          // Updating the flower price for that index
          updatedFlowerPriceTracker[existingFlowerIndex] = {
              ...updatedFlowerPriceTracker[existingFlowerIndex],
              unitprice: e.target.value
          };
          setFlowerPriceTracker(updatedFlowerPriceTracker)
      }
  }
  const fillFlowerDemand = (e, flowerIndex) => {
      e.preventDefault();
      const { value } = e.target;
      const filledStems = parseInt(value, 10); // Convertir a número entero base 10

      if (!isNaN(filledStems)) {
          const updatedDisplayFlowerData = [...displayFlowerData];
          const selectedFlower = updatedDisplayFlowerData[selectedRow][flowerIndex];
          
          // Modificar el valor de la demanda de la flor seleccionada
          selectedFlower.filledStems = filledStems;

          // Actualizar el estado displayFlowerData
          updatedDisplayFlowerData[selectedRow][flowerIndex] = selectedFlower;
          setDisplayFlowerData(updatedDisplayFlowerData);
      }
  }

  return (
    <div className='container mx-auto flex flex-col' style={{ maxHeight: '50vh' }}>
      <div className='flex justify-between items-center mb-4'>
          <button onClick={goBack} className='mt-4 text-blue-500 hover:text-blue-700'>go back</button>
          <h1 className='text-2xl font-bold '>Assign flowers</h1>
      </div>
      <div className='overflow-y-scroll w-full'>
        <table className='w-full table-auto border-collapse'>
          <thead>
              <tr>
                  {['Client', 'Date', 'Contact', 'selected'].map((name, index) => (
                      <td key={index} className='border p-2'>
                        {name}
                      </td>
                  ))}
              </tr>
          </thead>
          <tbody>
            {projectsInfo?.map((item, index) => (
              <tr key={index} onClick={() => setSelectedRow(index)} className='bg-gray-200'>
                  <td className='p-2 text-center'>{item?.projectclient}</td>
                  <td className='p-2 text-center'>{item?.projectdate}</td>
                  <td className='p-2 text-center'>{item?.projectcontact}</td>
                  <td className='p-2 text-center'>
                    <input type='checkbox' value={index} checked={selectedRow == index} onChange={() => {}}></input>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <table className='w-full table-auto border-collapse'> 
            <thead>
                <tr>
                    {['Flower name', 'Recipie stems', 'Unit price', 'Stems Used'].map((name, index) => (
                        <th key={index} className="border p-2">{name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
              {displayFlowerData[selectedRow]?.map((flower, index) => {
                const existingFlowerIndex = flowerPriceTracker.findIndex(item => item.flowerid === flower.flowerid);

                return <tr key={index} className='bg-gray-300'>
                  <td className=" p-2 text-center">{flower?.flowername}</td>
                  <td className=" p-2 text-center">{flower?.totalstems}</td>
                  <td className=" p-2 text-center">
                    <input className='border border-gray-300' type='number' value={flowerPriceTracker[existingFlowerIndex].unitprice} onChange={(e) => changeFlowerUnitPrice(e, flower.flowerid)}/>
                  </td>
                  <td className=" p-2 text-center">
                    <input className='border border-gray-300' type='number' value={flower.filledStems} onChange={(e) => fillFlowerDemand(e, index)} min={0}></input> 
                    <button className='bg-gray-200 px-5 mx-1' value={flower?.totalstems} onClick={(e) => fillFlowerDemand(e, index)}>all</button>
                  </td>
                  
                </tr>
              })}
            </tbody>
        </table>
      </div>
      <button className='bg-black text-white round my-5 mx-auto px-6 py-2'>Save Invoice</button>
    </div>
    
  )
}
