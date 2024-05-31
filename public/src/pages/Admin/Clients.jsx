import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton'
import AddClientPopup from '../../components/Popups/AddClientPopup'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'

const FETCH_CLIENTS_URL = '/api/clients'
const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {'Client ID': 'clientid', 'Name': 'clientname', 'Admin': ''}

export default function Clients() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewClientPopup, setShowNewClientPopup] = useState(false)
    const [clientsData, setClientsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);

    const [editClientData, setEditclientdata] = useState(null)

    const fetchClients = async () => {
        try {
            const response = await axiosPrivate.get(FETCH_CLIENTS_URL)
            setClientsData(response.data)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])
    
    const handleEditClient = (client) => {
        setEditclientdata(client)
        setShowNewClientPopup(true)
    } 

    const handleCloseClientPopup = (shouldRefresh) => {
        setShowNewClientPopup(false)
        setEditclientdata(null)
        if(shouldRefresh === true){
            fetchClients()
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
