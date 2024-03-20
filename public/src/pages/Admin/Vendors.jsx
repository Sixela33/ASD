import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton'
import AddVendorPopup from '../../components/Popups/AddVendorPopup'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'
import GoBackButton from '../../components/GoBackButton'

const FETCH_VENDORS_URL = '/api/vendors'
const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {'Vendor ID': 'vendorid', 'Name': 'vendorname', 'Admin': ''}

export default function Vendors() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewVendorPopup, setShowNewVendorPopup] = useState(false)
    const [vendorsData, setVendorsData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);

    const [editVendorData, setEditvendordata] = useState(null)

    const fetchVendors = async () => {
        try {
            const response = await axiosPrivate.get(FETCH_VENDORS_URL)
            console.log("response.data", response.data)
            setVendorsData(response.data)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    useEffect(() => {
        fetchVendors()
    }, [])
    
    const handleEditVendor = (vendor) => {
        setEditvendordata(vendor)
        setShowNewVendorPopup(true)
    } 

    const handleCloseVendorPopup = (shouldRefresh) => {
        setShowNewVendorPopup(false)
        setEditvendordata(null)
        if(shouldRefresh === true){
            console.log('refreshea')
            fetchVendors()
        }
    }

    const buttonOptions = [
        {text: 'Add new vendor', action: () => setShowNewVendorPopup(true)}, 
    ]

    return (
        vendorsData && <div className='container mx-auto mt-8 p-4 text-center'>
            <AddVendorPopup
                showPopup={showNewVendorPopup} 
                closePopup={handleCloseVendorPopup} 
                editVendorData={editVendorData}/>
                
            <div className='grid grid-cols-3 mb-4'>
                <GoBackButton className='col-span-1'/>
                <h1 className='col-span-1'>Vendors</h1>
            </div>
            <div className='table-container h-[70vh]'>
          
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
