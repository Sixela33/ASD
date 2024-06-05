import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton'
import AddClientPopup from '../../components/Popups/AddClientPopup'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'
import { debounce } from 'lodash'

const FETCH_CLIENTS_URL = '/api/clients'
const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {'Client ID': 'clientid', 'Name': 'clientname', 'Admin': ''}

export default function Clients() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewClientPopup, setShowNewClientPopup] = useState(false)
    const [clientsData, setClientsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);
    const [searchByName, setSearByName] = useState()

    const [editClientData, setEditclientdata] = useState(null)

    const fetchClients = async (name) => {
        try {
            const response = await axiosPrivate.get(FETCH_CLIENTS_URL, {params: {
                searchByName: name
            }})
            setClientsData(response.data)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    const debounced = useCallback(debounce(fetchClients, 600))

    useEffect(() => {
        fetchClients(searchByName)
    }, [])

    useEffect(() => {
        debounced(searchByName)
    }, [searchByName])
    
    const handleEditClient = (client) => {
        setEditclientdata(client)
        setShowNewClientPopup(true)
    } 

    const handleCloseClientPopup = (shouldRefresh) => {
        setShowNewClientPopup(false)
        setEditclientdata(null)
        if(shouldRefresh === true){
            fetchClients(searchByName)
        }
    }

    const buttonOptions = [
        {
            text: 'Add new client', 
            action: () => setShowNewClientPopup(true), 
            minPermissionLevel: 999,
            icon: '+'
        }, 
    ]

    return (
        clientsData && <div className='container mx-auto mt-8 p-4 text-center'>
            <AddClientPopup
                showPopup={showNewClientPopup} 
                closePopup={handleCloseClientPopup} 
                editClientData={editClientData}/>
                
            <div className=' mb-4'>
                <h1 >Clients</h1>
            </div>
            <div className='flex items-center'>
                <label className='mr-2'> Search by name: </label>
                <input value={searchByName} onChange={(e) => setSearByName(e.target.value)}></input>
            </div>
            <div className='table-container max-h-[60vh]'>
                <TableHeaderSort
                    headers={headers}
                    setSortConfig={setSortConfig}
                    defaultSortConfig={defaultSortConfig}
                    sortConfig={sortConfig}>
                    {sortData(clientsData, sortConfig).map((client, index) => {
                        return <tr key={index}>
                            <td>{client.clientid}</td>
                            <td>{client.clientname}</td>
                            <td>
                                <button onClick={() => handleEditClient(client)} className='go-back-button'>Edit</button>
                            </td>
                        </tr>
                    })}
                </TableHeaderSort>
            </div>
            <FloatingMenuButton options={buttonOptions}/>
        </div>
    )
}
