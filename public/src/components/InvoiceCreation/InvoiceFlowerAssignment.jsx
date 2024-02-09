import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage'
import useAlert from '../../hooks/useAlert'
import { aggregateFlowerData } from '../../utls/aggregateFlowerDataInvoices'
import InvoiceAddFlowerToProjectPopup from './InvoiceAddFlowerToProjectPopup'

const ARRANGEMENT_DATA_FETCH = '/api/projects/flowers'
const GET_PROJECTS_URL = '/api/projects/manyByID';
const ADD_INVOICE_URL = '/api/invoices'

export default function InvoiceFlowerAssignment({goBack, chosenProjects, invoiceData, invoiceFile}) {

  const [flowerData, setFlowerData] = useState([])
  const [displayFlowerData, setDisplayFlowerData] = useState([])
  const [selectedRow, setSelectedRow] = useState(0)
  const [projectsInfo, setProjectsInfo] = useState([])
  const [addFlowerPopup, toggleAddFlowerPopup] = useState(false)
  const [flowerPriceTracker, setFlowerPriceTracker] = useState([])

  const CHOSEN_PROJECTS_SORTED = chosenProjects.sort((a, b) => a - b)

  const axiosPrivate = useAxiosPrivate();
  const axiosPrivateImage = useAxiosPrivateImage()
  const { setMessage } = useAlert();

  const fetchData = async () => {
    try {
      const projects = await axiosPrivate.post(GET_PROJECTS_URL, JSON.stringify({ids: CHOSEN_PROJECTS_SORTED}))
      const resSorted = projects?.data.sort((a, b) => a.projectid - b.projectid )
      setProjectsInfo(resSorted)

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
    // adding whitespaces so that the arrangements coincide with their projects
    const sortedArray = Array(CHOSEN_PROJECTS_SORTED.length).fill([])
    aggregatedFlowerArray.map(item => {
      let index = CHOSEN_PROJECTS_SORTED.findIndex(element => element == item[0].projectid)
      sortedArray[index] = item
    })

    while (sortedArray.length < CHOSEN_PROJECTS_SORTED.length) {
      console.log(sortedArray)
      sortedArray.push([])
    }
    console.log(sortedArray)
    setFlowerPriceTracker(aggregatedUniqueFlowers)
    setDisplayFlowerData(sortedArray)

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

  const addFlowerToProject = (flowerData) => {
    // checking if the project already has this flower
    const flowerExists = displayFlowerData[selectedRow].findIndex(item => item.flowerid === flowerData.flowerid)

    // if it doies , error
    if (flowerExists != -1){
      console.log("Flower already is in project")
      return
    }

    // checking if the price of the type of flower is being tracked
    const existingFlowerPriceIndex = flowerPriceTracker.findIndex(item => item.flowerid === flowerData.flowerid)

    // if its not, i add it
    if (existingFlowerPriceIndex == -1){
      const newPriceObject = {
        addedStems: 0,
        flowerid: flowerData.flowerid,
        flowername: flowerData.flowername,
        unitprice: ""
      }
      const newPrices = [...flowerPriceTracker]
      newPrices.push(newPriceObject)
      setFlowerPriceTracker(newPrices)
    }

    // adding the flower to the project
    const newFlowerObject = {
      filledStems: "",
      flowerid: flowerData.flowerid,
      flowername: flowerData.flowername,
      projectid: CHOSEN_PROJECTS_SORTED[selectedRow],
      totalstems: 0,
    }

    const newFlowerData = [... displayFlowerData]
    newFlowerData[selectedRow].push(newFlowerObject)

    setDisplayFlowerData(newFlowerData)
  }

  const submitInvoiceCreation = async (e) => {
    e.preventDefault();
    try {
      const InvoiceFlowerData = addPrices()
      const formDataToSend = new FormData();
      const totalAdded = flowerPriceTracker?.reduce((value, flower) => {
        return value + flower.addedStems * flower.unitprice
      }, 0)

      if (invoiceData.invoiceAmount != totalAdded) {
        setMessage("The invoice ammount and RegisteredExpenses do not coincide", true)
        return
      }
      formDataToSend.append('invoiceData', JSON.stringify(invoiceData));
      formDataToSend.append('InvoiceFlowerData', JSON.stringify(InvoiceFlowerData));
      formDataToSend.append('invoiceFile', invoiceFile);

      const response = await axiosPrivateImage.post(ADD_INVOICE_URL, formDataToSend);

      console.log(response);
      setMessage('Invoice Loaded successfully', false)
    } catch (error) {
      setMessage(error.response?.data?.message, true);
    }
  }

  return (<>
      <div className='container mx-auto flex flex-col' style={{ maxHeight: '80vh' }}>
        <InvoiceAddFlowerToProjectPopup showPopup={addFlowerPopup} submitFunction={flower => addFlowerToProject(flower)} closePopup={() =>toggleAddFlowerPopup(false)}/>
        <div className='flex justify-between items-center mb-4'>
            <button onClick={goBack} className='mt-4 text-blue-500 hover:text-blue-700'>go back</button>
            <h1 className='text-2xl font-bold '>Assign flowers</h1>
        </div>
        <div className='overflow-y-scroll w-full h-1/2vh' style={{ height: '20vh' }}>
          <table className='w-full table-fixed border-collapse' >
            <thead>
                <tr>
                    {['Project id', 'Client', 'Date', 'Contact', 'selected'].map((name, index) => (
                        <td key={index} className='border p-2'>
                          {name}
                        </td>
                    ))}
                </tr>
            </thead>
            <tbody>
              {projectsInfo?.map((item, index) => (
                <tr key={index} onClick={() => setSelectedRow(index)} className='bg-gray-200'>
                    <td className='p-2 text-center'>{item?.projectid}</td>
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
          <button className='bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded' onClick={() => toggleAddFlowerPopup(true)}>add flower to project</button>
        </div>
        <button className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded my-1 w-1/2" onClick={submitInvoiceCreation}>Save Invoice</button>
      </div>
    </>
  )
}
