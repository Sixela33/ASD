import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';

const GET_PROJECTS_URL = '/api/projects/list/';


const ProjectsList = () => {
    const [projectsInfo, setProjectsInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [dataLeft, setDataLeft] = useState(true)
    
    const [ref, inView] = useInView({});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate();
    const navigateTo = useNavigate();

    const handleRowClick = (row) => {
        console.log(row)
        navigateTo(`/projects/${row?.projectid}`);
    }  

    const fetchData = async () => {
        try {
            if (!isLoading && dataLeft) {
                setIsLoading(true);
                console.log(page)
                const response = await axiosPrivate.get(GET_PROJECTS_URL + page);
                if (response.data?.length === 0) {
                    setDataLeft(false);
                }
                setProjectsInfo((prevProjects) => [...prevProjects, ...response.data]);
                setPage(page + 1);
            }
        } catch (error) {
            setMessage(error.response?.data?.message, true);
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
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
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            {['Client', 'Description', 'Contact', 'Date'].map((name, index) => (
                                <th key={index} className="border p-2">{name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {projectsInfo.map((item, index) => (
                            <tr key={index} onClick={() => handleRowClick(item)} className='bg-gray-200'>
                                <td className=" p-2 text-center">{item?.projectclient}</td>
                                <td className=" p-2 text-center">{item?.projectdescription}</td>
                                <td className=" p-2 text-center">{item?.projectcontact}</td>
                                <td className=" p-2 text-center">{item?.projectdate}</td>
                            </tr>
                        ))}
                        <tr ref={ref}></tr>

                    </tbody>
                </table>
                {isLoading && <p className="text-center my-4">Loading...</p>}

            </div>
        </div>
    );
};

export default ProjectsList;
