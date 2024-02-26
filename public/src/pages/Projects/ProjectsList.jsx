import React, { useEffect, useState, useRef, useCallback } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import QueryDataSortTable from '../../components/Tables/QueryDataSortTable';
import { debounce } from 'lodash';

const GET_PROJECTS_URL = '/api/projects/list/';
const defaultSortCOnfig = { key: null, direction: 'asc' }
const ProjectsList = () => {
    const [projectsInfo, setProjectsInfo] = useState([]);
    const [sortConfig, setSortConfig] = useState(defaultSortCOnfig);
    const [showOpenOnly, setShowOpenOnly] = useState(true)
    const page = useRef(0) 
    const dataLeft = useRef(true)    
    
    const [ref, inView] = useInView({});

    const { setMessage } = useAlert();
    const axiosPrivate = useAxiosPrivate();
    const navigateTo = useNavigate();

    const handleRowClick = (row) => {
        navigateTo(`/projects/${row?.projectid}`, {state: row});
    }

    const fetchData = useCallback((sortConfig, showOpen) => {
        if (!dataLeft.current) {
            return;
        }
        axiosPrivate.get(GET_PROJECTS_URL + page.current + '?orderBy='+ sortConfig.key + '&order=' + sortConfig.direction + '&showOpenOnly=' + showOpen )
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
    });

    const debounced = useCallback(debounce(fetchData, 200), []);

    useEffect(() => {
        setProjectsInfo([])
        page.current = 0
        dataLeft.current=true
        debounced(sortConfig, showOpenOnly)
        
    }, [sortConfig, showOpenOnly])

    useEffect(() => {
        if (inView) {
            debounced(sortConfig, showOpenOnly)
        }
    }, [inView]);


    return (
        <div className="container mx-auto mt-8 flex flex-col" style={{ height: '80vh' }}>
            <div className='flex justify-between items-center mb-4'>
                <button onClick={() => navigateTo('/')} className="text-blue-500 hover:text-blue-700">go back</button>
                <h1 className="text-2xl font-bold">ProjectsList</h1>
                <Link to="/project/create" className="bg-black text-white font-bold py-2 px-4 rounded">Create new Project</Link>
            </div>
            <div className="flex items-center mb-4">
                <label className="mr-2">Show closed Projects:</label>
                <input type='checkbox' value={showOpenOnly} onClick={() => setShowOpenOnly(!showOpenOnly)} className="h-6 w-6"></input>
            </div>
            <div className='overflow-y-scroll h-[70vh] w-full mt-2'>

                <QueryDataSortTable
                    headers={{
                        "id": "projectid",
                        "Client": "projectclient",
                        "Description": "projectdescription",
                        "Contact": "projectcontact",
                        "Date": "projectdate"
                    }}
                    data={projectsInfo}
                    onRowClick={handleRowClick}
                    setSortConfig={setSortConfig}
                    InViewRef={ref}
                    showViewRef={dataLeft.current}
                    sortConfig={sortConfig}
                    defaultSortConfig={defaultSortCOnfig}
                >

                </QueryDataSortTable>
            </div>
        </div>
    );
};

export default ProjectsList;
