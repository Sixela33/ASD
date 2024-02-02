import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useAlert from '../hooks/useAlert'
import { aggregateFlowerData } from '../utls/aggregateFlowerDataInvoices'

const ARRANGEMENT_DATA_FETCH = '/api/projects/flowers'
const GET_PROJECTS_URL = '/api/projects/manyByID';
const ADD_INVOICE_URL = '/api/invoices'

export default function InvoiceFlowerAssignment({goBack, chosenProjects, invoiceData}) {

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

          updatedFlowerPriceTracker[existingFlowerIndex].unitprice = e.target.value
          setFlowerPriceTracker(updatedFlowerPriceTracker)
      }
  }

  // I use this function to track the total ammount of evry stem so i dont have to iterate through the whole flower x projects array
  const changeTotalFlowersInInvoice = (flowerID, diference) => {
    const existingFlowerIndex = flowerPriceTracker.findIndex(item => item.flowerid === flowerID)
      
    if (existingFlowerIndex !== -1) {
        const updatedFlowerPriceTracker = [...flowerPriceTracker]

        updatedFlowerPriceTracker[existingFlowerIndex].addedStems += diference

        setFlowerPriceTracker(updatedFlowerPriceTracker)
        console.log(updatedFlowerPriceTracker)
    }
  }

  const fillFlowerDemand = (e, flowerIndex) => {
      e.preventDefault();
      const { value } = e.target;

      if (!isNaN(value)) {
        const updatedDisplayFlowerData = [...displayFlowerData];
        const selectedFlower = updatedDisplayFlowerData[selectedRow][flowerIndex];
        
        // Modificar el valor de la demanda de la flor seleccionada
        const ammountDif = value - selectedFlower.filledStems
        changeTotalFlowersInInvoice(selectedFlower.flowerid, ammountDif)
        selectedFlower.filledStems = value;

        // Actualizar el estado displayFlowerData
        updatedDisplayFlowerData[selectedRow][flowerIndex] = selectedFlower;
        setDisplayFlowerData(updatedDisplayFlowerData);
      }
  }

  const addPrices = () => {
    return displayFlowerData.map(project => {
        return project.map(flowerItem => {
            const existingPriceFlower = flowerPriceTracker.find(item => item.flowerid === flowerItem.flowerid);
            if (existingPriceFlower) {
                flowerItem.unitPrice = existingPriceFlower.unitprice;
            }
            return flowerItem;
        });
    });
  }


  const submitInvoiceCreation = async (e) => {
    e.preventDefault();
    try {
      const InvoiceFlowerData = addPrices()
      //const stringifiedDisplayFlowerData = JSON.stringify(InvoiceFlowerData);
  
      const response = await axiosPrivate.post(ADD_INVOICE_URL, JSON.stringify({
        invoiceData,
        InvoiceFlowerData
      }));

      console.log(response);
    } catch (error) {
      setMessage(error.response?.data?.message, true);
    }
  }

  return (
    <div className='container mx-auto flex flex-col' style={{ maxHeight: '80vh' }}>
      <div className='flex justify-between items-center mb-4'>
          <button onClick={goBack} className='mt-4 text-blue-500 hover:text-blue-700'>go back</button>
          <h1 className='text-2xl font-bold '>Assign flowers</h1>
      </div>
      <div className='overflow-y-scroll w-full h-1/2vh' style={{ height: '20vh' }}>
        <table className='w-full table-fixed border-collapse' >
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
      <div className='overflow-y-scroll w-full my-3' style={{ height: '30vh' }}>
        <table className='w-full table-fixed border-collapse'> 
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

                return <tr key={index} className='bg-gray-300 max-h-[10px]'>
                  <td className=" p-2 text-center" >{flower?.flowername}</td>
                  <td className=" p-2 text-center">{flower?.totalstems}</td>
                  <td className=" p-2 text-center">
                    <input className='border border-gray-300 w-1/2' type='number' value={flowerPriceTracker[existingFlowerIndex].unitprice} onChange={(e) => changeFlowerUnitPrice(e, flower.flowerid)}/>
                  </td>
                  <td className=" p-2 text-center">
                    <input className='border border-gray-300 w-1/2' type='number' value={flower.filledStems} onChange={(e) => fillFlowerDemand(e, index)} min={0}></input> 
                    <button className='bg-gray-200 px-5 mx-1' value={flower?.totalstems} onClick={(e) => fillFlowerDemand(e, index)}>all</button>
                  </td>
                </tr>
              })}
              
            </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center my-1">
        <p className="font-bold">Total invoice amount: {invoiceData.invoiceAmount}</p>
        <p className="font-bold">Registered Expenses: {flowerPriceTracker?.reduce((value, flower) => {
          return value + flower.addedStems * flower.unitprice
        }, 0)}</p>
        <button className='bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded'>add flower to project</button>
      </div>
      <button className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded my-1 w-1/2" onClick={submitInvoiceCreation}>Save Invoice</button>
    </div>
    
  )
}
