import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import AddColorPupup from '../../components/Popups/AddColorPupup'
import { debounce } from 'lodash'
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup'

const GET_COLORS_URL = '/api/flowers/colors'
const DELETE_COLOR_URL = '/api/flowers/colors'

export default function FlowerColors() {
  const [colorData, setcolorData] = useState(null)
  const [shownewColorPopup, setShowNewColorPopup] = useState(false)
  const [colorToEdit, setColorToEdit] = useState(null) 
  const [searchBy, setColorSearchBy] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedForRemoval, setSelectedForRemoval] = useState()

  const axiosPrivate = useAxiosPrivate()

  const fetchColors = async (name) => {
    try {
      const response = await axiosPrivate.get(GET_COLORS_URL, {params: {
        searchByName: name
      }})
      setcolorData(response.data)
    } catch (error) {
      console.log(error)
      setMessage(error.response?.data)            
    }
  }

  const debounced = useCallback(debounce(fetchColors, 600))


  useEffect(() => {
    fetchColors(searchBy)
  }, [])

  useEffect(() => {
    debounced(searchBy)
  }, [searchBy])

  const handleEditColor = (color) => {
    setColorToEdit(color)
    setShowNewColorPopup(true)
  }
  
  const handleClosePopup = (shouldRefresh) => {
    if(shouldRefresh) {
      fetchColors(searchBy)
    }
    setShowNewColorPopup(false)
  }

  const deleteColor = async (id) => {
    try {
        await axiosPrivate.delete(DELETE_COLOR_URL, {params: {
            id: id
        }})
        fetchColors(searchBy)
    } catch (error) {
        setMessage(error.response?.data)            
    }
}

  const headers = {'Color name': 'colorname', 'Admin': ' '}
  return (
    colorData && <div className='container mx-auto mt-8 p-4 text-center'>
        <AddColorPupup
          showPopup={shownewColorPopup}
          closePopup={handleClosePopup}
          editClorData={colorToEdit}
        ></AddColorPupup>
        <ConfirmationPopup
          showPopup={showConfirmation}
          closePopup={() => {
              setSelectedForRemoval(undefined)
              setShowConfirmation(false)
          }}
          confirm={() => deleteColor(selectedForRemoval)}
        >
          <div>
            <h1>Are you sure you want to remove this color?</h1>
            <p>This action is permanent</p>
          </div>
        </ConfirmationPopup>
        <div className=' mb-4'>
            <h1>FlowerColors</h1>
        </div>
        <div className='flex items-center justify-between'>
          <div>
              <label className='mr-2'> Search by name: </label>
              <input value={searchBy} onChange={(e) => setColorSearchBy(e.target.value)}></input>
          </div>
          <button className='buton-main' onClick={() => setShowNewColorPopup(true)}>Add new color</button>
        </div>
        <div className='table-container max-h-[50vh]'>
          <TableHeaderSort
            headers={headers}
          >
            {colorData.map((color, index) => {
             return <tr key={index}>
                <td>{color.colorname}</td>
                <td>
                  <button onClick={() => {
                    setSelectedForRemoval(color.colorid)
                    setShowConfirmation(true)
                  }} className='go-back-button mx-4'>Remove</button>
                  <button className='go-back-button mx-4' onClick={() => {handleEditColor(color)}}>Edit</button>
                </td>
              </tr>
              
            })}

          </TableHeaderSort>
        </div>
    </div>
  )
}
