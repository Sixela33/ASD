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

    const page = useRef(0)
    const dataLeft = useRef(true)    

    const [ref, inView] = useInView({delay: 10000});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate()

    const fetchData = (sortConfigg) => {
        if (!dataLeft.current) {
            return;
        }
    
        axiosPrivate.get(GET_PROJECTS_URL + page.current + '?showOpenOnly=true' + '&orderBy='+ sortConfigg.key + '&order=' + sortConfigg.direction)
            .then(response => {
                page.current = page.current + 1;
                console.log("data: ", response.data)
                if (response.data?.length === 0) {
                    dataLeft.current = false;
                    return;
                }
    
                setProjectsInfo((prevProjects) => [...prevProjects, ...response.data]);
            })
            .catch(error => {
                setMessage(error.response?.data?.message, true);
                console.error('Error fetching data:', error);
            })
    };

    const debounced = useCallback(debounce(fetchData, 500), []);

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
        debounced(sortConfig)
    }, [sortConfig])

    useEffect(() => {
        debounced(sortConfig)
        
    }, [inView])

    useEffect(() => {
        fetchData(sortConfig)
        
    }, [])

    return (
        <div className='container mx-auto flex flex-col' style={{ maxHeight: '50vh' }}>
            <div className='flex justify-between items-center mb-4'>
                <button onClick={goBack} className='mt-4 text-blue-500 hover:text-blue-700'>go back</button>
                <h1 className='text-2xl font-bold '>Choose projects</h1>
            </div>
            <div className='overflow-y-scroll w-full'>

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
                > 
                    {projectsInfo.map((item, index) => (
                        <tr key={index} onClick={() => handleRowClick(item)} className='bg-gray-200'>
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
                    <tr ref={ref}></tr>
                </TableHeaderSort>
            </div>
        <button onClick={goNext} className='bg-black text-white font-bold py-2 my-3 px-4 rounded'>Continue</button>
        </div>
    );
}