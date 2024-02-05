import React, { useEffect, useState, useRef } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_TD_STYLE } from '../../styles';

const GET_PROJECTS_URL = '/api/projects/list/';


const ProjectsList = () => {
    const [projectsInfo, setProjectsInfo] = useState([]);
    const page = useRef(0)
    const isLoading = useRef(false)    
    const dataLeft = useRef(true)    
    
    const [ref, inView] = useInView({});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate();
    const navigateTo = useNavigate();

    const handleRowClick = (row) => {
        console.log(row)
        navigateTo(`/projects/${row?.projectid}`);
    }  

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
                    console.log("aaa");
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

    useEffect(() => {
        if (inView) {
            fetchData();
        }
    }, [inView]);


    return (
        <div className="container mx-auto mt-8 flex flex-col" style={{maxHeight: '80vh'}}>
            <div className='flex justify-between items-center mb-4'>
                <h1 className="text-2xl font-bold">ProjectsList</h1>
                <Link to="/project/create" className="bg-black text-white font-bold py-2 px-4 rounded">Create new Project</Link>
            </div>
            <div className="overflow-y-scroll w-full">
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr>
                            {['id', 'Client', 'Description', 'Contact', 'Date'].map((name, index) => (
                                <th key={index} className="border p-2">{name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {projectsInfo.map((item, index) => (
                            <tr key={index} onClick={() => handleRowClick(item)} className='bg-gray-200'>
                                <td className={BASE_TD_STYLE}>{item?.projectid}</td>
                                <td className={BASE_TD_STYLE}>{item?.projectclient}</td>
                                <td className={BASE_TD_STYLE}>{item?.projectdescription}</td>
                                <td className={BASE_TD_STYLE}>{item?.projectcontact}</td>
                                <td className={BASE_TD_STYLE}>{item?.projectdate}</td>
                            </tr>
                        ))}
                        <tr ref={ref}></tr>

                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default ProjectsList;
