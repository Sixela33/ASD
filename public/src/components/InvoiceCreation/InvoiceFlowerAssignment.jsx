import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAxiosPrivateImage from '../../hooks/useAxiosPrivateImage'
import useAlert from '../../hooks/useAlert'
import { aggregateFlowerData } from '../../utls/flowerAggregation/aggregateFlowerDataInvoices'
import InvoiceAddFlowerToProjectPopup from './InvoiceAddFlowerToProjectPopup'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { toCurrency } from '../../utls/toCurrency'
import LoadingPopup from '../LoadingPopup'

const GET_PROJECTS_URL = '/api/projects/manyByID'
const GET_SINGLE_FLOWER_DATA_URL = '/api/flowers/addToinvoice/'
const ADD_INVOICE_URL = '/api/invoices'
const UPDATE_INVOICE_URL = '/api/invoices'

export default function InvoiceFlowerAssignment({goBack, chosenProjects, invoiceData, invoiceFile, loadedFlowers, setLoading}) {

    const axiosPrivate = useAxiosPrivate();
    const axiosPrivateImage = useAxiosPrivateImage()
    const { setMessage } = useAlert();
    const navigateTo = useNavigate()

    const [flowerData, setFlowerData] = useState([])
    const [projectsInfo, setProjectsInfo] = useState([])
    const [showLoading, setShowLoading] = useState(false)
    const [displayFlowerData, setDisplayFlowerData] = useState([])
    const [selectedRow, setSelectedRow] = useState(0)
    const [addFlowerPopup, toggleAddFlowerPopup] = useState(false)

    const[errorRows, setErrorRows] = useState({})

    const CHOSEN_PROJECTS_SORTED = chosenProjects.sort((a, b) => a - b)
    if (!loadedFlowers) loadedFlowers = []

    const fetchData = useCallback(async () => {
        try {
            setShowLoading(true)
            const response = await axiosPrivate.post(GET_PROJECTS_URL, JSON.stringify({ids: chosenProjects}))
            const {projects, flowers} = response.data
            const resSorted = projects.sort((a, b) => a.projectid - b.projectid )
            setProjectsInfo(resSorted)
            setFlowerData(flowers)

        } catch (error) {
            //console.log(error)
            console.error('Error fetching data:', error);
            setMessage(error.response?.data, true);
        } finally {
            setShowLoading(false)
        }
    })

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        
        let temp_flower_data = flowerData
        
        if(loadedFlowers && loadedFlowers.length != 0) {
            let tempLoadedFlowers = loadedFlowers.filter(item => chosenProjects.includes(item.projectid));
            temp_flower_data = tempLoadedFlowers
        }
        
        let {aggregatedFlowerArrayByProject} = aggregateFlowerData(temp_flower_data)
    
        const sortedArray = Array(CHOSEN_PROJECTS_SORTED.length).fill([])
    
        aggregatedFlowerArrayByProject.forEach(item => {
            let index = CHOSEN_PROJECTS_SORTED.findIndex(element => element == item[0].projectid)
            sortedArray[index] = item;
        })
    
        while (sortedArray.length < CHOSEN_PROJECTS_SORTED.length) {
            sortedArray.push([])
        }
    
        setDisplayFlowerData(sortedArray)
    }, [flowerData, loadedFlowers, CHOSEN_PROJECTS_SORTED])

    const modifyFlowerData = (e, flowerIndex) => {
        e.preventDefault()

        const { name, value } = e.target

        if(!displayFlowerData[selectedRow][flowerIndex]) {
            return
        }

        const temp_var = [...displayFlowerData]

        temp_var[selectedRow][flowerIndex] = {
            ...displayFlowerData[selectedRow][flowerIndex],
            [name]:value
        }

        setDisplayFlowerData(temp_var)
    }

    const addFlowerToProject = async (flowerData) => {
        try {
            let getFlowerData
            setShowLoading(true)
            // Getting latest invoice data from the database
            try {
                getFlowerData = await axiosPrivate.get(GET_SINGLE_FLOWER_DATA_URL + flowerData.flowerid)
                getFlowerData = getFlowerData.data[0]
            } catch (e) {
                console.log("Could not get flower data")
            }
    
            const newFlowerObject = {
                flowerid: flowerData.flowerid,
                projectid: CHOSEN_PROJECTS_SORTED[selectedRow],
                numstems: 0,
                unitprice: getFlowerData?.unitprice || 0,
                flowername: flowerData.flowername,
            }
        
            setDisplayFlowerData(prevData => {
                const updatedData = [...prevData]
                updatedData[selectedRow] = [...updatedData[selectedRow], newFlowerObject]
                return updatedData
            })
    
        } catch (e) {
            console.log(e)
        } finally {
            setShowLoading(false)
        }
    }
    
    const getTotalAdded = () => {
        // Iterates through all the projects and its flowers and adds up how much spending is registered
        return displayFlowerData?.reduce((value, projects) => {
            let projectSum = projects.reduce((sum, flower) => {
                return sum + (flower.unitprice * flower.numstems)
            }, 0)
            return value + projectSum
        }, 0) ?? 0
    }

    const getTotalAddedAndWithNoStemData = () => {
        // Iterates through all the projects and its flowers and adds up how much spending is registered
        // AND records wich flowers got added the "stemsperbox" property but with no "stemsperbox" specified
        return displayFlowerData?.reduce((value, project, projectIndex) => {
            let projectSum = project.reduce((sum, flower, flowerIndex) => {
                sum.totalAdded += (flower.numstems * flower.unitprice);
                if (flower.numstems && flower.unitprice == 0) {
                    sum.addedWIthNoStemInfo += 1;
                    if (!sum.noStemInfoFlowers[projectIndex]) {
                        sum.noStemInfoFlowers[projectIndex] = [];
                    }
                    sum.noStemInfoFlowers[projectIndex].push(flowerIndex);
                }
                return sum;
            }, {totalAdded: 0, addedWIthNoStemInfo: 0, noStemInfoFlowers: {}});
            
            value.totalAdded += projectSum.totalAdded;
            value.addedWIthNoStemInfo += projectSum.addedWIthNoStemInfo;
            value.noStemInfoFlowers = { ...value.noStemInfoFlowers, ...projectSum.noStemInfoFlowers };
            
            return value;
        }, {totalAdded: 0, addedWIthNoStemInfo: 0, noStemInfoFlowers: {}}) ?? {totalAdded: 0, addedWIthNoStemInfo: 0, noStemInfoFlowers: {}};
    };

    const submitInvoiceCreation = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            setErrorRows({})
            const formDataToSend = new FormData();
            
            
            // this function checks if the total of flowers added coincide with the invoice AND
            // if the user added stems but did not set the price
            const validationOutput = getTotalAddedAndWithNoStemData()

            if (toCurrency(invoiceData.invoiceAmount) != toCurrency(validationOutput.totalAdded)) {
                setMessage("The invoice ammount and Registered Expenses do not coincide", true)
                return
            }

            if (validationOutput.addedWIthNoStemInfo != 0){
                setMessage("Added stems with no stems per unit assigned")
                setErrorRows(validationOutput.noStemInfoFlowers)
                return
            }
            
            let invoiceFlowerData = displayFlowerData.flat(Infinity)

            
            let temp = invoiceFlowerData
            .filter(item => item.numstems && item.numstems != 0)
            .map(item => {
                let temp = {...item}
                delete temp.totalstems
                delete temp.flowername
                return temp
            })
            console.log("invoiceFlowerData", temp)
            
            formDataToSend.append('invoiceData', JSON.stringify(invoiceData));
            formDataToSend.append('InvoiceFlowerData', JSON.stringify(temp));
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
            <LoadingPopup showPopup={showLoading}/>
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
                        {['Flower name', 'Recipe stems', 'Stems Bought','Unit price'].map((name, index) => (
                            <th key={index} >{name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {displayFlowerData[selectedRow]?.map((flower, index) => {
                        return <tr key={index} className={errorRows[selectedRow]?.includes(index) && 'border-2 border-rose-500'}>
                            <td>{flower?.flowername}</td>
                            <td>{flower?.totalstems}</td>
                            <td>
                                <input className='w-1/2 no-spinner' type='number' name='numstems' value={flower.numstems} onChange={(e) => modifyFlowerData(e, index)}/>
                            </td>
                            <td>
                                $<input className='w-1/2 no-spinner' type='number' name='unitprice' value={flower.unitprice} onChange={(e) => modifyFlowerData(e, index)}/>
                            </td>
                            
                        </tr>
                    })}
                    
                </tbody>
            </table>
            </div>
            <div className="flex justify-between items-center my-1">
                <p className="font-bold">Total invoice amount: {toCurrency(invoiceData.invoiceAmount)}</p>
                <p className="font-bold">Registered Expenses: {toCurrency(getTotalAdded())}</p>
                <button className='buton-secondary ' onClick={() => toggleAddFlowerPopup(true)}>add flower to project</button>
            </div>
            <button className='buton-main my-1 w-1/2 mx-auto' disabled={toCurrency(invoiceData.invoiceAmount) != toCurrency(getTotalAdded())} onClick={submitInvoiceCreation}>Save Invoice</button>
        </div>
  )
}
