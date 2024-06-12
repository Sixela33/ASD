import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import AddClientPopup from '../../components/Popups/AddClientPopup'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'
import { debounce } from 'lodash'
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup'

const FETCH_CLIENTS_URL = '/api/clients'
const DELETE_CLIENT_URL = '/api/clients'

const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {'Client ID': 'clientid', 'Name': 'clientname', 'Admin': ''}

export default function Clients() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewClientPopup, setShowNewClientPopup] = useState(false)
    const [clientsData, setClientsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);
    const [searchByName, setSearByName] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [selectedForRemoval, setSelectedForRemoval] = useState()

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

    const deleteClient = async (id) => {
        try {
            await axiosPrivate.delete(DELETE_CLIENT_URL, {params: {
                id: id
            }})
            fetchClients(searchByName)
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

    return (
        clientsData && <div className='container mx-auto mt-8 p-4 text-center'>
            <AddClientPopup
                showPopup={showNewClientPopup}
                closePopup={handleCloseClientPopup} 
                editClientData={editClientData}/>
            <ConfirmationPopup
                showPopup={showConfirmation}
                closePopup={() => {
                    setSelectedForRemoval(undefined)
                    setShowConfirmation(false)
                }}
                confirm={() => deleteClient(selectedForRemoval)}
                >
                <div>
                    <h1>Are you sure you want to remove this vendor?</h1>
                    <p>This action is permanent</p>
                </div>
            </ConfirmationPopup>
            <div className=' mb-4'>
                <h1>Clients</h1>
            </div>
            <div className='flex items-center justify-between'>
                <div>
                    <label className='mr-2'> Search by name: </label>
                    <input value={searchByName} onChange={(e) => setSearByName(e.target.value)}></input>
                </div>
                <button className='buton-main' onClick={() => setShowNewClientPopup(true)}>Add new client</button>
            </div>
            <div className='table-container max-h-[50vh]'>
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
                                <button onClick={() => {
                                    setSelectedForRemoval(client.clientid)
                                    setShowConfirmation(true)
                                }} className='go-back-button mx-4'>Remove</button>
                                <button onClick={() => handleEditClient(client)} className='go-back-button mx-4'>Edit</button>
                            </td>
                        </tr>
                    })}
                </TableHeaderSort>
            </div>
        </div>
    )
}
