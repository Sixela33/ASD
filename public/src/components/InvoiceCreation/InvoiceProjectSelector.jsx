import React, { useEffect, useRef, useState, useCallback } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useInView } from 'react-intersection-observer';
import TableHeaderSort from '../Tables/TableHeaderSort';
import { debounce } from 'lodash';

const GET_PROJECTS_URL = '/api/projects/list/';
const defaultSortCOnfig = { key: "projectid", direction: 'asc' }

export default function InvoiceProjectSelector({ goBack, selectedProjects, setSelectedProjects, goNext}) {
    const [projectsInfo, setProjectsInfo] = useState([]);
    const [sortConfig, setSortConfig] = useState(defaultSortCOnfig);
    const [showOpenOnly, setShowOpenOnly] = useState(true)
    const [searchByID, setSearchByID] = useState('')

    const page = useRef(0)
    const dataLeft = useRef(true)    

    const [ref, inView] = useInView({delay: 10000});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate()
    
    const fetchData =  async (sortConfig, showOpen, searchByID, searchByContact, searchByDescription, selectedClient) => {
        if (!dataLeft.current) {
            return;
        }

        if(!sortConfig) sortConfig = {key:'', direction:''}
        if(showOpen === undefined) showOpen = true
        if(!searchByID) searchByID = ''
        if(!searchByContact) searchByContact = ''
        if(!searchByDescription) searchByDescription = ''
        if(!selectedClient) selectedClient = ''

        try {
            const response = await axiosPrivate.get(GET_PROJECTS_URL + page.current + 
                '?orderBy='+ sortConfig.key + 
                '&order=' + sortConfig.direction + 
                '&showOpenOnly=' + showOpen +
                '&searchByID=' + searchByID + 
                '&searchByContact=' + searchByContact +
                '&searchByDescription=' + searchByDescription + 
                '&searchByClient=' + selectedClient)
            
            page.current = page.current + 1;
    
            if (response.data?.length === 0) {
                dataLeft.current = false;
                return;
            }

            setProjectsInfo((prevProjects) => [...prevProjects, ...response.data]); 
        } catch (error) {
            setMessage(error.response?.data, true);
            console.error('Error fetching data:', error);
        }
    };

    const debounced = useCallback(debounce(fetchData, 100), []);

    const handleRowClick = (item) => {
        setSelectedProjects((prevSelectedProjects) => {
        if (prevSelectedProjects.includes(item.projectid)) {
            return prevSelectedProjects.filter((projectId) => projectId !== item.projectid);
        } else {
            return [...prevSelectedProjects, item.projectid];
        }
        });
    };

    useEffect(() => {
        setProjectsInfo([])
        page.current = 0;
        dataLeft.current=true
        debounced(sortConfig, showOpenOnly, searchByID)
    }, [sortConfig, showOpenOnly, searchByID])

    useEffect(() => {
        debounced(sortConfig, showOpenOnly)
    }, [inView])

    useEffect(() => {
        debounced(sortConfig, showOpenOnly)
        
    }, [])


    return (
        <div>
            <div className='grid grid-cols-3 mb-4'>
                <button className='go-back-button col-span-1' onClick={goBack} >Go Back</button>
                <h1 className='col-span-1'>Choose projects</h1>
            </div>
            <div className='flex flex-row justify-evenly'>
                <div className='flex items-center'>
                    <label className="mr-2">Show closed projects:</label>
                    <input type='checkbox' value={showOpenOnly} onClick={() => setShowOpenOnly(!showOpenOnly)} className="h-6 w-6"></input>
                </div>
                <div className='flex flex-row items-center'>
                    <label >Search by project id:</label>
                    <input type="text" value={searchByID} onChange={(e) => setSearchByID(e.target.value)}/>
                </div>
            </div>
            <div className='table-container h-[50vh]'>

                <TableHeaderSort
                headers ={{
                    'project id': "projectid", 
                    'Client': "projectclient", 
                    'Date': "projectdate", 
                    'Description': "projectdescription", 
                    'Contact': "projectcontact", 
                    'selected':""
                }}
                setSortConfig = {setSortConfig}
                defaultSortConfig ={defaultSortCOnfig}
                sortConfig ={sortConfig}
                styles={{"tbodyStyles": 'hover:cursor-pointer'}}

                > 
                    {projectsInfo.map((item, index) => (
                        <tr key={index} onClick={() => handleRowClick(item)} >
                            <td className='p-2 text-center'>{item?.projectid}</td>
                            <td className='p-2 text-center'>{item?.projectclient}</td>
                            <td className='p-2 text-center'>{item?.projectdate}</td>
                            <td className='p-2 text-center'>{item?.projectdescription}</td>
                            <td className='p-2 text-center'>{item?.projectcontact}</td>
                            <td className='p-2 text-center'>
                                <input type='checkbox' value={item.projectid} checked={selectedProjects.includes(item.projectid)} onChange={() => {}}></input>
                            </td>
                        </tr>
                    ))}
                    <tr ref={ref}><></></tr>
                </TableHeaderSort>
            </div>
        <button onClick={goNext} className='buton-main my-3'>Continue</button>
        </div>
    );
}