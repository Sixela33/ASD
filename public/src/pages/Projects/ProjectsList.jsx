import React, { useEffect, useState, useRef, useCallback } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import TableHeaderSort from '../../components/Tables/TableHeaderSort';

const colData = {
    "id": "projectid",
    "Client": "projectclient",
    "Description": "projectdescription",
    "Contact": "projectcontact",
    "Date": "projectdate",
    "Status": "projectstatus"
}

const GET_PROJECTS_URL = '/api/projects/list/';
const GET_CLIENTS_LIST = '/api/clients'

const defaultSortCOnfig = { key: 'projectid', direction: 'asc' }

const ProjectsList = ({ searchParams }) => {
    const page = useRef(0)
    const dataLeft = useRef(true)
    
    const [ref, inView] = useInView({});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate();
    const navigateTo = useNavigate();

    const [projectsInfo, setProjectsInfo] = useState([]);
    const [clientsList, setClientsList] = useState([])

    const [sortConfig, setSortConfig] = useState(defaultSortCOnfig);
    const [showOpenOnly, setShowOpenOnly] = useState(true)

    const [searchByID, setSearchByID] = useState('')
    const [searchByContact, setSearchByContact] = useState('')
    const [searchByDescription, setSearchByDescription] = useState('')
    const [selectedClient, setSelectedClient] = useState('')

    const handleRowClick = (row) => {
        navigateTo(`/projects/${row?.projectid}`, {state: row});
    }

    const getClientList = async () => {
        try {
            const clientsResponse = await axiosPrivate.get(GET_CLIENTS_LIST)
            setClientsList(clientsResponse?.data)
        } catch (error) {
            setMessage(error.response?.data?.message, true);

        }
    }
    
    const fetchData =  async (sortConfig, showOpen, searchByID, searchByContact, searchByDescription, selectedClient) => {
        if (!dataLeft.current) {
            return;
        }
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
            setMessage(error.response?.data?.message, true);
            console.error('Error fetching data:', error);
        }
    };

    const debounced = useCallback(debounce(fetchData, 300), []);

    useEffect(() => {
        setProjectsInfo([])
        page.current = 0
        dataLeft.current=true
        debounced(sortConfig, showOpenOnly, searchByID, searchByContact, searchByDescription, selectedClient)
        
    }, [sortConfig, showOpenOnly, searchByID, searchByContact, searchByDescription, selectedClient])

    useEffect(() => {
        if (inView) {
            debounced(sortConfig, showOpenOnly, searchByID, searchByContact, searchByDescription, selectedClient)
        }
    }, [inView]);

    useEffect(() => {
        getClientList()
    }, [])

    const projectStatusStyles = {
        0: "bg-red-500",
        1: "bg-yellow-500",
        2: "bg-green-500"
    }

    const projectStatusText = {
        0: "No arrangements Created",
        1: "Designs Needed",
        2: "Complete"
    }

    return (
        <div className='container mx-auto mt-8 p-4 text-center flex flex-col'>
            <div  className="grid grid-cols-3 mb-4 ">
                <button onClick={() => navigateTo('/')} className="go-back-button col-span-1">Go Back</button>
                <h1 className='col-span-1'>Projects</h1>
                <Link to="/project/create" className='buton-main col-span-1 mx-auto'>Create new Project</Link>
            </div>
            <div className="flex items-center mb-4 space-x-4 justify-evenly">
                
                <div className='flex items-center'>
                    <label className="mr-2">Show closed Projects:</label>
                    <input type='checkbox' value={showOpenOnly} onClick={() => setShowOpenOnly(!showOpenOnly)} className="h-6 w-6"></input>
                </div>
                <div className='flex flex-col'>
                    <label >search By ID:</label>
                    <input type="text" value={searchByID} onChange={(e) => setSearchByID(e.target.value)}/>
                </div>

                <div className='flex flex-col'>
                    <label >search By Contact:</label>
                    <input type="text" value={searchByContact} onChange={(e) => setSearchByContact(e.target.value)}/>
                </div>

                <div className='flex flex-col'>
                    <label>search By Description:</label>
                    <input type="text" value={searchByDescription} onChange={(e) => setSearchByDescription(e.target.value)}/>
                </div>
                <div className='flex flex-col'>
                    <label>Filter by client:</label>
                        <select className='p-2' onChange={e => setSelectedClient(e.target.value)}>
                                <option value={''}>Select client</option>
                                {clientsList.map((item, index) => {
                                    return <option value={item.clientid} key={index}>{item.clientname}</option>
                                })}
                        </select>
                </div>                        
                
            </div>
            <div className='table-container h-[60vh]'>
                <TableHeaderSort
                headers={colData} 
                setSortConfig={setSortConfig}
                sortConfig={sortConfig} 
                defaultSortConfig={defaultSortCOnfig}
                >
                {projectsInfo.map((item, rowIndex) => (
                    <tr key={rowIndex}  onClick={() => handleRowClick(item)}>
                        <td>{item.projectid}</td>
                        <td>{item.projectclient}</td>
                        <td>{item.projectdescription}</td>
                        <td>{item.projectcontact}</td>
                        <td>{item.projectdate}</td>
                        <td className={`${projectStatusStyles[item.projectstatus]}`}>{projectStatusText[item.projectstatus]}</td>
                    </tr>
                ))}
                
                {dataLeft.current && (
                    <tr ref={ref}>
                        <></>
                    </tr>
                )}
        </TableHeaderSort>
            </div>
        </div>
    );
};

export default ProjectsList;
