import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useAlert from '../hooks/useAlert'
import { aggregateFlowerData } from '../utls/aggregateFlowerData';

const ARRANGEMENT_DATA_FETCH = '/api/projects/arrangements/'
const GET_PROJECTS_URL = '/api/projects/manyByID';

export default function InvoiceFlowerAssignment({goBack, chosenProjects}) {

  const [flowerData, setFlowerData] = useState([])
  const [displayFlowerData, setDisplayFlowerData] = useState([])
  const [selectedRow, setSelectedRow] = useState(0)
  const [projectsInfo, setProjectsInfo] = useState([])
  
  const axiosPrivate = useAxiosPrivate();
  const { setMessage } = useAlert();

  const handleChangeSelectedProject = (item) => {
    setSelectedRow(item.projectid)
  }

  const fetchData = async () => {
    try {
      let flowerDataTempArray = []

      const projects = await axiosPrivate.post(GET_PROJECTS_URL, JSON.stringify({ids: chosenProjects}))
      setProjectsInfo(projects?.data)
      for (let projectIndex of chosenProjects) {
        
        const response = await axiosPrivate.get(ARRANGEMENT_DATA_FETCH + (projectIndex))
        flowerDataTempArray.push(response?.data?.flowers)
      }
      console.log(flowerDataTempArray)
      setFlowerData(flowerDataTempArray)

    } catch (error) {
      setMessage(error.response?.data?.message, true);
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const result = aggregateFlowerData(flowerData[selectedRow - 1])
    setDisplayFlowerData(result)

  }, [flowerData, selectedRow])
  
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
                <tr key={index} onClick={() => handleChangeSelectedProject(item)} className='bg-gray-200'>
                    <td className='p-2 text-center'>{item?.projectclient}</td>
                    <td className='p-2 text-center'>{item?.projectdate}</td>
                    <td className='p-2 text-center'>{item?.projectcontact}</td>
                    <td className='p-2 text-center'>
                      <input type='checkbox' value={item.projectid} checked={selectedRow == item.projectid} onChange={() => {}}></input>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
        <table>
          <thead>
            <tr>
                {['Flower name', 'Total stems', 'Unit price', 'Estimated Cost'].map((name, index) => (
                    <th key={index} className="border p-2">{name}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {displayFlowerData?.map((item, index) => (
            <tr key={index} className='bg-gray-200'>
              <td className=" p-2 text-center">{item?.flowername}</td>
              <td className=" p-2 text-center">{item?.totalstems}</td>
              <td className=" p-2 text-center">{item?.unitprice}</td>
              <td className=" p-2 text-center">{item?.estimatedcost}</td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </div>
    
  )
}
