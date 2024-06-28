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
            console.log("ups")
            return
        }

        const temp_var = [...displayFlowerData]

        temp_var[selectedRow][flowerIndex] = {
            ...displayFlowerData[selectedRow][flowerIndex],
            [name]:value
        }

        setDisplayFlowerData(temp_var)
    }

    const addFlowerToProject = (flowerData) => {
        try {
            let newFlowerData = displayFlowerData

            // adding the flower to the project
            const newFlowerObject = {
                flowerid: flowerData.flowerid,
                projectid: CHOSEN_PROJECTS_SORTED[selectedRow],
                stemsperbox: 0,
                boxprice: 0,
                boxespurchased: 0,
                totalstems: 0,
                flowername: flowerData.flowername,
            };
    
            newFlowerData[selectedRow] = [...newFlowerData[selectedRow], newFlowerObject]
            setDisplayFlowerData(newFlowerData)
            
        } catch (e)  {
            console.log(e)
        }
    };

    const getTotalAdded = () => {
        // Iterates through all the projects and its flowers and adds up how much spending is registered
        return displayFlowerData?.reduce((value, projects) => {
            let projectSum = projects.reduce((sum, flower) => {
                return sum + (flower.boxprice * flower.boxespurchased)
            }, 0)
            return value + projectSum
        }, 0) ?? 0
    }

    const getTotalAddedAndWithNoStemData = () => {
        // Iterates through all the projects and its flowers and adds up how much spending is registered
        // AND records wich flowers got added the "stemsperbox" property but with no "stemsperbox" specified
        return displayFlowerData?.reduce((value, project) => {
            let projectSum = project.reduce((sum, flower) => {
                sum.totalAdded += (flower.boxprice * flower.boxespurchased);
                if (flower.boxespurchased != 0 && flower.stemsperbox == 0) {
                    sum.addedWIthNoStemInfo += 1;
                    if (!sum.noStemInfoFlowers[flower.projectid]) {
                        sum.noStemInfoFlowers[flower.projectid] = [];
                    }
                    sum.noStemInfoFlowers[flower.projectid].push(flower.flowerid);
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
            const formDataToSend = new FormData();

            
            // this function checks if the total of flowers added coincide with the invoice AND
            // if the user added stems but did not set the price
            const validationOutput = getTotalAddedAndWithNoStemData()

            console.log("validationOutput", validationOutput)

            if (invoiceData.invoiceAmount != validationOutput.totalAdded) {
                setMessage("The invoice ammount and Registered Expenses do not coincide", true)
                return
            }

            if (validationOutput.addedWIthNoStemInfo != 0){
                setMessage("Added stems with no price assigned")
                return
            }

            let invoiceFlowerData = displayFlowerData.flat(Infinity)

            let temp = invoiceFlowerData
            .filter(item => item.boxespurchased)
            .map(item => {
                let temp = {
                    ...item,
                    unitprice: item.boxprice / item.boxespurchased,
                }
                delete temp.totalstems
                delete temp.flowername
                return temp
            })

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
                        {['Flower name', 'Recipe stems', 'Bought Stems', 'Stems per Unit', 'Unit price', 'Units purchased'].map((name, index) => (
                            <th key={index} >{name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {displayFlowerData[selectedRow]?.map((flower, index) => {
                        return <tr key={index}>
                            <td>{flower?.flowername}</td>
                            <td>{flower?.totalstems}</td>
                            <td>{flower.stemsperbox * flower.boxespurchased}</td>
                            <td>
                                <input className='w-1/2' type='number' name='stemsperbox' min={0} value={flower.stemsperbox} onChange={(e) => modifyFlowerData(e, index)}></input> 
                            </td>
                            <td>
                                $<input className=' w-1/2' type='number' name='boxprice' min={0} value={flower.boxprice} onChange={(e) => modifyFlowerData(e, index)}/>
                            </td>
                            <td>
                                <input className='w-1/2' type='number' name='boxespurchased' min={0} value={flower.boxespurchased} onChange={(e) => modifyFlowerData(e, index)}></input> 
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
            <button className='buton-main my-1 w-1/2 mx-auto' disabled={invoiceData.invoiceAmount != invoiceData.invoiceAmount} onClick={submitInvoiceCreation}>Save Invoice</button>
        </div>
  )
}
