import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton'
import AddVendorPopup from '../../components/Popups/AddVendorPopup'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'
import { debounce } from 'lodash'
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup'

const FETCH_VENDORS_URL = '/api/vendors'
const DELETE_VENDOR_URL = '/api/vendors'

const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {
    'Vendor ID': 'vendorid', 
    'Name': 'vendorname', 
    'Code': 'vendorcode', 
    'Admin': ''
}

export default function Vendors() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewVendorPopup, setShowNewVendorPopup] = useState(false)
    const [vendorsData, setVendorsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);
    const [searchByName, setSearchByName] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [selectedForRemoval, setSelectedForRemoval] = useState()

    const [editVendorData, setEditvendordata] = useState(null)

    const fetchVendors = async (name) => {
        try {
            const response = await axiosPrivate.get(FETCH_VENDORS_URL, {params:{
                searchByName: name
            }})
            setVendorsData(response.data)
        } catch (error) {
            setMessage(error.response?.data.message)            
        }
    }

    const debounced = useCallback(debounce(fetchVendors, 600))

    useEffect(() => {
        fetchVendors(searchByName)
    }, [])

    useEffect(() => {
        debounced(searchByName)
    }, [searchByName])
    
    const handleEditVendor = (vendor) => {
        setEditvendordata(vendor)
        setShowNewVendorPopup(true)
    } 

    const handleCloseVendorPopup = (shouldRefresh) => {
        setShowNewVendorPopup(false)
        setEditvendordata(null)
        if(shouldRefresh === true){
            fetchVendors(searchByName)
        }
    }

    const deleteVendor = async (id) => {
        try {
            await axiosPrivate.delete(DELETE_VENDOR_URL, {params: {
                id: id
            }})
            fetchVendors(searchByName)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    return (
        vendorsData && <div className='container mx-auto mt-8 p-4 text-center'>
            <AddVendorPopup
                showPopup={showNewVendorPopup} 
                closePopup={handleCloseVendorPopup} 
                editVendorData={editVendorData}/>
            <ConfirmationPopup 
                showPopup={showConfirmation}
                closePopup={() => {
                    setSelectedForRemoval(undefined)
                    setShowConfirmation(false)
                }}
                confirm={() => deleteVendor(selectedForRemoval)}
            >
            <div>
                <h1>Are you sure you want to remove this vendor?</h1>
                <p>This action is permanent</p>
            </div>
                </ConfirmationPopup>
                <div>
                    <h1>Vendors</h1>
                </div>
                <div className='flex items-center justify-between'>
                    <div>
                        <label className='mr-2'> Search by name: </label>
                        <input value={searchByName} onChange={(e) => setSearchByName(e.target.value)}></input>
                    </div>
                    <button className='buton-main' onClick={() => setShowNewVendorPopup(true)}>Add new vendor</button>
                </div>
                <div className='table-container max-h-[50vh]'>
                    <TableHeaderSort
                        headers={headers}
                        setSortConfig={setSortConfig}
                        defaultSortConfig={defaultSortConfig}
                        sortConfig={sortConfig}>
                        {sortData(vendorsData, sortConfig).map((vendor, index) => {
                            return <tr key={index}>
                                <td>{vendor.vendorid}</td>
                                <td>{vendor.vendorname}</td>
                                <td>{vendor.vendorcode}</td>
                                <td>
                                    <button onClick={() => handleEditVendor(vendor)} className='go-back-button mx-4'>Edit</button>
                                    <button onClick={() => {
                                        setSelectedForRemoval(vendor.vendorid)
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
