import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton'
import AddVendorPopup from '../../components/Popups/AddVendorPopup'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'
import { debounce } from 'lodash'

const FETCH_VENDORS_URL = '/api/vendors'
const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {'Vendor ID': 'vendorid', 'Name': 'vendorname', 'Admin': ''}

export default function Vendors() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewVendorPopup, setShowNewVendorPopup] = useState(false)
    const [vendorsData, setVendorsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);
    const [searchByName, setSearchByName] = useState()

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

    const buttonOptions = [
        {
            text: 'Add new vendor', 
            action: () => setShowNewVendorPopup(true),
            minPermissionLevel: 999,
            icon: '+'
        }, 
    ]

    return (
        vendorsData && <div className='container mx-auto mt-8 p-4 text-center'>
                <AddVendorPopup
                    showPopup={showNewVendorPopup} 
                    closePopup={handleCloseVendorPopup} 
                    editVendorData={editVendorData}/>
                <div>
                    <h1>Vendors</h1>
                </div>
                <div className='table-container max-h-[60vh]'>
                    <div className='flex items-center'>
                        <label className='mr-2'> Search by name: </label>
                        <input value={searchByName} onChange={(e) => setSearchByName(e.target.value)}></input>
                    </div>
                    <TableHeaderSort
                        headers={headers}
                        setSortConfig={setSortConfig}
                        defaultSortConfig={defaultSortConfig}
                        sortConfig={sortConfig}>
                        {sortData(vendorsData, sortConfig).map((vendor, index) => {
                            return <tr key={index}>
                                <td>{vendor.vendorid}</td>
                                <td>{vendor.vendorname}</td>
                                <td>
                                    <button onClick={() => handleEditVendor(vendor)} className='go-back-button'>Edit</button>
                                </td>
                            </tr>
                        })}
                    </TableHeaderSort>
                </div>
                <FloatingMenuButton options={buttonOptions}/>  
            </div>
    )
}
