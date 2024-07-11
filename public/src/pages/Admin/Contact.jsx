import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import AddContactPopup from '../../components/Popups/AddContactPopup'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'
import { debounce } from 'lodash'
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup'

const FETCH_CONTACTS_URL = '/api/contacts'
const DELETE_CONTACT_URL = '/api/contacts'

const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {'Contact ID': 'contactid', 'Name': 'contactname', 'Admin': ''}

export default function Contacts() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewContactPopup, setShowNewContactPopup] = useState(false)
    const [contactsData, setContactsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);
    const [searchByName, setSearByName] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [selectedForRemoval, setSelectedForRemoval] = useState()

    const [editContactData, setEditcontactdata] = useState(null)

    const fetchContacts = async (name) => {
        try {
            const response = await axiosPrivate.get(FETCH_CONTACTS_URL, {params: {
                searchByName: name
            }})
            setContactsData(response.data)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    const deleteContact = async (id) => {
        try {
            await axiosPrivate.delete(DELETE_CONTACT_URL, {params: {
                id: id
            }})
            fetchContacts(searchByName)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    const debounced = useCallback(debounce(fetchContacts, 600))

    useEffect(() => {
        fetchContacts(searchByName)
    }, [])

    useEffect(() => {
        debounced(searchByName)
    }, [searchByName])
    
    const handleEditContact = (contact) => {
        setEditcontactdata(contact)
        setShowNewContactPopup(true)
    } 

    const handleCloseContactPopup = (shouldRefresh) => {
        setShowNewContactPopup(false)
        setEditcontactdata(null)
        if(shouldRefresh === true){
            fetchContacts(searchByName)
        }
    }

    return (
        contactsData && <div className='container mx-auto mt-8 p-4 text-center'>
            <AddContactPopup
                showPopup={showNewContactPopup}
                closePopup={handleCloseContactPopup} 
                editContactData={editContactData}/>
            <ConfirmationPopup
                showPopup={showConfirmation}
                closePopup={() => {
                    setSelectedForRemoval(undefined)
                    setShowConfirmation(false)
                }}
                confirm={() => deleteContact(selectedForRemoval)}
                >
                <div>
                    <h1>Are you sure you want to remove this vendor?</h1>
                    <p>This action is permanent</p>
                </div>
            </ConfirmationPopup>
            <div className=' mb-4'>
                <h1>Contacts</h1>
            </div>
            <div className='flex items-center justify-between'>
                <div>
                    <label className='mr-2'> Search by name: </label>
                    <input value={searchByName} onChange={(e) => setSearByName(e.target.value)}></input>
                </div>
                <button className='buton-main' onClick={() => setShowNewContactPopup(true)}>Add new contact</button>
            </div>
            <div className='table-container max-h-[50vh]'>
                <TableHeaderSort
                    headers={headers}
                    setSortConfig={setSortConfig}
                    defaultSortConfig={defaultSortConfig}
                    sortConfig={sortConfig}>
                    {sortData(contactsData, sortConfig).map((contact, index) => {
                        return <tr key={index}>
                            <td>{contact.contactid}</td>
                            <td>{contact.contactname}</td>
                            <td>
                                <button onClick={() => handleEditContact(contact)} className='go-back-button mx-4'>Edit</button>
                                <button onClick={() => {
                                    setSelectedForRemoval(contact.contactid)
                                    setShowConfirmation(true)
                                }} className='go-back-button mx-4'>Remove</button>
                            </td>
                        </tr>
                    })}
                </TableHeaderSort>
            </div>
        </div>
    )
}
