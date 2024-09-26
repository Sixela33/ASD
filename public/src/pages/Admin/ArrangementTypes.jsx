import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAlert from '../../hooks/useAlert'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import { sortData } from '../../utls/sortData'
import { debounce } from 'lodash'
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup'
import AddArrangementTypePopup from '../../components/Popups/AddNewArrangementPopup'

const FETCH_TYPES_URL = '/api/arrangements/types'
const DELETE_TYPE_URL = '/api/arrangements/types'

const defaultSortConfig = { key: null, direction: 'asc' }

const headers = {'ArrangementType ID': 'arrangementTypeid', 'Name': 'arrangementTypename', 'Admin': ''}

export default function ArrangementTypes() {
    const axiosPrivate = useAxiosPrivate()
    const { setMessage } = useAlert()

    const [showNewArrangementTypePopup, setShowNewArrangementTypePopup] = useState(false)
    const [arrangementTypesData, setArrangementTypesData] = useState(null)
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);
    const [searchByName, setSearByName] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [selectedForRemoval, setSelectedForRemoval] = useState()

    const [editArrangementTypeData, setEditarrangementTypedata] = useState(null)

    const fetchArrangementTypes = async (name) => {
        try {
            const response = await axiosPrivate.get(FETCH_TYPES_URL, {params: {
                searchByName: name
            }})
            setArrangementTypesData(response.data)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    const deleteArrangementType = async (id) => {
        try {
            await axiosPrivate.delete(DELETE_TYPE_URL, {params: {
                arrangementtypeid: id
            }})
            fetchArrangementTypes(searchByName)
        } catch (error) {
            setMessage(error.response?.data)            
        }
    }

    const debounced = useCallback(debounce(fetchArrangementTypes, 600))

    useEffect(() => {
        fetchArrangementTypes(searchByName)
    }, [])

    useEffect(() => {
        debounced(searchByName)
    }, [searchByName])
    
    const handleEditArrangementType = (arrangementType) => {
        setEditarrangementTypedata(arrangementType)
        setShowNewArrangementTypePopup(true)
    } 

    const handleCloseArrangementTypePopup = (shouldRefresh) => {
        setShowNewArrangementTypePopup(false)
        setEditarrangementTypedata(null)
        if(shouldRefresh === true){
            fetchArrangementTypes(searchByName)
        }
    }

    return (
        arrangementTypesData && <div className='container mx-auto mt-8 p-4 text-center'>
            <AddArrangementTypePopup
                showPopup={showNewArrangementTypePopup}
                closePopup={handleCloseArrangementTypePopup} 
                editArrangementTypeData={editArrangementTypeData}/>
            <ConfirmationPopup
                showPopup={showConfirmation}
                closePopup={() => {
                    setSelectedForRemoval(undefined)
                    setShowConfirmation(false)
                }}
                confirm={() => deleteArrangementType(selectedForRemoval)}
                >
                <div>
                    <h1>Are you sure you want to remove this arrangement type?</h1>
                    <p>This action is permanent</p>
                </div>
            </ConfirmationPopup>
            <div className=' mb-4'>
                <h1>ArrangementTypes</h1>
            </div>
            <div className='flex items-center justify-between'>
                <div>
                    <label className='mr-2'> Search by name: </label>
                    <input value={searchByName} onChange={(e) => setSearByName(e.target.value)}></input>
                </div>
                <button className='buton-main' onClick={() => setShowNewArrangementTypePopup(true)}>Add new type</button>
            </div>
            <div className='table-container max-h-[50vh]'>
                <TableHeaderSort
                    headers={headers}
                    setSortConfig={setSortConfig}
                    defaultSortConfig={defaultSortConfig}
                    sortConfig={sortConfig}>
                    {sortData(arrangementTypesData, sortConfig).map((arrangementType, index) => {
                        return <tr key={index}>
                            <td>{arrangementType.arrangementtypeid}</td>
                            <td>{arrangementType.typename}</td>
                            <td>
                                <button onClick={() => handleEditArrangementType(arrangementType)} className='go-back-button mx-4'>Edit</button>
                                <button onClick={() => {
                                    setSelectedForRemoval(arrangementType.arrangementtypeid)
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
