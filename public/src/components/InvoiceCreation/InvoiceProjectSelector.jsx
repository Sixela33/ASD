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

    const page = useRef(0)
    const dataLeft = useRef(true)    

    const [ref, inView] = useInView({delay: 10000});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate()

    const fetchData = (sortConfigg, showOpenOnly) => {
        if (!dataLeft.current) {
            return;
        }
    
        axiosPrivate.get(GET_PROJECTS_URL + page.current + '?showOpenOnly='+ showOpenOnly + '&orderBy='+ sortConfigg.key + '&order=' + sortConfigg.direction)
            .then(response => {
                page.current = page.current + 1;

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
        debounced(sortConfig, showOpenOnly)
    }, [sortConfig])

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