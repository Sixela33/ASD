import React, { useEffect, useRef, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useInView } from 'react-intersection-observer';

const GET_PROJECTS_URL = '/api/projects/list/';

export default function InvoiceProjectSelector({ goBack, selectedProjects, setSelectedProjects, goNext}) {
    const [projectsInfo, setProjectsInfo] = useState([]);
    const page = useRef(0)
    const isLoading = useRef(false)    
    const dataLeft = useRef(true)    

    const [ref, inView] = useInView({delay: 10000});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate()

    const fetchData = () => {
        if (isLoading.current || !dataLeft.current) {
            return;
        }
    
        isLoading.current = true;
    
        axiosPrivate.get(GET_PROJECTS_URL + page.current)
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
            .finally(() => {
                isLoading.current = false;
            });
    };

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
        fetchData()
        
    }, [inView])

    return (
        <div className='container mx-auto flex flex-col' style={{ maxHeight: '50vh' }}>
            <div className='flex justify-between items-center mb-4'>
                <button onClick={goBack} className='mt-4 text-blue-500 hover:text-blue-700'>go back</button>
                <h1 className='text-2xl font-bold '>Choose projects</h1>
            </div>
            <div className='overflow-y-scroll w-full'>
            
                <table className='w-full table-auto border-collapse'>
                    <thead>
                        <tr>
                            {['project id', 'Client', 'Date', 'Description', 'Contact', 'selected'].map((name, index) => (
                                <td key={index} className='border p-2'>
                                {name}
                                </td>
                            ))}
                        </tr>
                    </thead>
                <tbody>
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
                </tbody>
                </table>
            </div>
        <button onClick={goNext} className='bg-black text-white font-bold py-2 my-3 px-4 rounded'>Continue</button>
        </div>
    );
}