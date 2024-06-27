import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage'
import useAlert from '../../hooks/useAlert'
import { aggregateFlowerData } from '../../utls/flowerAggregation/aggregateFlowerDataInvoices'
import InvoiceAddFlowerToProjectPopup from './InvoiceAddFlowerToProjectPopup'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { toCurrency } from '../../utls/toCurrency'

const GET_PROJECTS_URL = '/api/projects/manyByID';
const ADD_INVOICE_URL = '/api/invoices'
const UPDATE_INVOICE_URL = '/api/invoices'

export default function InvoiceFlowerAssignment({goBack, chosenProjects, invoiceData, invoiceFile, loadedFlowers, setLoading}) {

    const axiosPrivate = useAxiosPrivate();
    const axiosPrivateImage = useAxiosPrivateImage()
    const { setMessage } = useAlert();
    const navigateTo = useNavigate()

    const [flowerData, setFlowerData] = useState([])
    const [projectsInfo, setProjectsInfo] = useState([])

    const [displayFlowerData, setDisplayFlowerData] = useState([])
    const [selectedRow, setSelectedRow] = useState(0)
    const [addFlowerPopup, toggleAddFlowerPopup] = useState(false)
    const [flowerPriceTracker, setFlowerPriceTracker] = useState([])

    const CHOSEN_PROJECTS_SORTED = chosenProjects.sort((a, b) => a - b)
    if (!loadedFlowers) loadedFlowers = []

    const fetchData = useCallback(async () => {
        try {
            const response = await axiosPrivate.post(GET_PROJECTS_URL, JSON.stringify({ids: chosenProjects}))
            const {projects, flowers} = response.data
            const resSorted = projects.sort((a, b) => a.projectid - b.projectid )
            setProjectsInfo(resSorted)
            setFlowerData(flowers)
                
        } catch (error) {
            //console.log(error)
            console.error('Error fetching data:', error);
            setMessage(error.response?.data, true);
        }
    })

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        
        let temp_flower_data = flowerData

        if(loadedFlowers) {
            let tempLoadedFlowers = loadedFlowers.filter(item => chosenProjects.includes(item.projectid));
            temp_flower_data.push(...tempLoadedFlowers)
        }

        let {aggregatedFlowerArrayByProject, aggregatedUniqueFlowers} = aggregateFlowerData(temp_flower_data)
        
        // Forcing prices to be the ones added in this invoice
        if(loadedFlowers) {
            loadedFlowers.map(flower => {
                let ix = aggregatedUniqueFlowers.findIndex(f => f.flowerid == flower.flowerid)
                if (ix != -1) {
                    aggregatedUniqueFlowers[ix].unitprice = flower.unitprice
                }
            })
        }
    
        const sortedArray = Array(CHOSEN_PROJECTS_SORTED.length).fill([])
    
        aggregatedFlowerArrayByProject.forEach(item => {
            let index = CHOSEN_PROJECTS_SORTED.findIndex(element => element == item[0].projectid)
            sortedArray[index] = item;
        })
    
        while (sortedArray.length < CHOSEN_PROJECTS_SORTED.length) {
            sortedArray.push([])
        }
    
        setFlowerPriceTracker(aggregatedUniqueFlowers)
        setDisplayFlowerData(sortedArray)
    }, [flowerData, loadedFlowers, CHOSEN_PROJECTS_SORTED])
    
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

    // Change the ammount of flowers that are added to the invoice
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

    const addFlowerToProject = (flowerData) => {
        // checking if the project already has this flower
        const flowerExists = displayFlowerData[selectedRow].findIndex(item => item.flowerid === flowerData.flowerid);
        
        // if it doies, error
        if (flowerExists !== -1) {

            setMessage("Flower already exists in the project")
            return;
        }

        // checking if the price of the type of flower is being tracked
        const existingFlowerPriceIndex = flowerPriceTracker.findIndex(item => item.flowerid === flowerData.flowerid);
    
        // if its not, i add it
        if (existingFlowerPriceIndex === -1) {
            const newPriceObject = {
                addedStems: 0,
                flowerid: flowerData.flowerid,
                flowername: flowerData.flowername,
                unitprice: ""
            };
    
            const newPrices = [...flowerPriceTracker, newPriceObject];
            setFlowerPriceTracker(newPrices);
        }
    
        // adding the flower to the project
        const newFlowerObject = {
            filledStems: "",
            flowerid: flowerData.flowerid,
            flowername: flowerData.flowername,
            projectid: CHOSEN_PROJECTS_SORTED[selectedRow],
            totalstems: 0,
        };
        
        const newFlowerData = displayFlowerData.map((projectFlowers, index) => {
            if (index === selectedRow) {
                return [...projectFlowers, newFlowerObject];
            }
            return projectFlowers.slice(); // Creating shallow copy of other project arrays
        });
    
        setDisplayFlowerData(newFlowerData);
    };
  
    const addPrices = () => {
        const result = displayFlowerData.flatMap(project => {
            return project.map(flowerItem => {
                const existingPriceFlower = flowerPriceTracker.find(item => item.flowerid === flowerItem.flowerid);
                
                // cleaning up the flower data object
                if (!(flowerItem.filledStems == '' || flowerItem.filledStems == 0)) {
                    return {
                        flowerid: flowerItem.flowerid, 
                        projectid: flowerItem.projectid, 
                        unitPrice: existingPriceFlower.unitprice,
                        filledStems: flowerItem.filledStems
                    };
                }
            }).filter(Boolean); // Filtering indefined values
        });
    
        return result;
    }

    const getTotalAdded = () => {
        return flowerPriceTracker?.reduce((value, flower) => {
            return value + flower.addedStems * flower.unitprice
        }, 0)
    }

    const submitInvoiceCreation = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            let invoiceFlowerData = addPrices()
            const formDataToSend = new FormData();

            invoiceFlowerData = invoiceFlowerData.flat(0)
            
            // this function checks if the total of flowers added coincide with the invoice AND
            // if the user added stems but did not set the price
            const validationInput = flowerPriceTracker?.reduce((value, flower) => {
                let temp = value
                temp.totalAdded += flower.addedStems * flower.unitprice
                if (flower.addedStems != 0 && flower.unitprice == 0) {
                temp.AddedWithNoPrice += 1
                }
                return temp 
            }, {totalAdded: 0, AddedWithNoPrice: 0})

            if (invoiceData.invoiceAmount != validationInput.totalAdded) {
                setMessage("The invoice ammount and Registered Expenses do not coincide", true)
                return
            }

            if (validationInput.AddedWithNoPrice != 0){
                setMessage("Added stems with no price assigned")
                return
            }

            formDataToSend.append('invoiceData', JSON.stringify(invoiceData));
            formDataToSend.append('InvoiceFlowerData', JSON.stringify(invoiceFlowerData));
            formDataToSend.append('invoiceFile', invoiceFile);

            if (!invoiceData.invoiceid) {
                await axiosPrivateImage.post(ADD_INVOICE_URL, formDataToSend);
                setMessage('Invoice Loaded successfully', false)
            } else {
                await axiosPrivateImage.patch(UPDATE_INVOICE_URL, formDataToSend);
                setMessage('Invoice Updated successfully', false)
            }

            navigateTo('/invoice')
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data, true);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='container mx-auto flex flex-col'>
            <InvoiceAddFlowerToProjectPopup 
                showPopup={addFlowerPopup} 
                submitFunction={flower => addFlowerToProject(flower)} 
                closePopup={() => toggleAddFlowerPopup(false)}/>
            <div className='grid grid-cols-3 mb-4'>
                <button onClick={goBack} className='go-back-button col-span-1'>Go Back</button>
                <h1 className='col-span-1'>Assign flowers</h1>
            </div>
            <div className='table-container h-[20vh]'>
            <table >
                <thead>
                    <tr>
                        {['Project id', 'Client', 'Date', 'Contact', 'selected'].map((name, index) => (
                            <td key={index} >
                            {name}
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                {projectsInfo?.map((item, index) => (
                    <tr key={index} onClick={() => setSelectedRow(index)} >
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
            <div className='table-container h-[30vh]'>
            <table> 
                <thead>
                    <tr>
                        {['Flower name', 'Recipe stems', 'Stems Used', 'Unit price'].map((name, index) => (
                            <th key={index} >{name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {displayFlowerData[selectedRow]?.map((flower, index) => {
                        const existingFlowerIndex = flowerPriceTracker.findIndex(item => item.flowerid === flower.flowerid);

                        return <tr key={index}>
                            <td>{flower?.flowername}</td>
                            <td>{flower?.totalstems}</td>
                            <td>
                                <input className='w-1/2' type='number' min={0} value={flower.filledStems} onChange={(e) => fillFlowerDemand(e, index)}></input> 
                                <button className='mx-2 go-back-button' value={flower?.totalstems} onClick={(e) => fillFlowerDemand(e, index)}>All</button>
                            </td>
                            <td>
                                $<input className=' w-1/2' type='number' min={0} value={flowerPriceTracker[existingFlowerIndex].unitprice} onChange={(e) => changeFlowerUnitPrice(e, flower.flowerid)}/>
                            </td>
                        </tr>
                    })}
                    
                </tbody>
            </table>
            </div>
            <div className="flex justify-between items-center my-1">
                <p className="font-bold">Total invoice amount: ${toCurrency(invoiceData.invoiceAmount)}</p>
                <p className="font-bold">Registered Expenses: ${toCurrency(getTotalAdded())}</p>
                <button className='buton-secondary ' onClick={() => toggleAddFlowerPopup(true)}>add flower to project</button>
            </div>
            <button className='buton-main my-1 w-1/2 mx-auto' disabled={getTotalAdded() != invoiceData.invoiceAmount} onClick={submitInvoiceCreation}>Save Invoice</button>
        </div>
  )
}
