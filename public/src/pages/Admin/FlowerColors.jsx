import React, { useEffect, useState, useCallback } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import AddColorPupup from '../../components/Popups/AddColorPupup'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton'
import { debounce } from 'lodash'

const GET_COLORS_URL = '/api/flowers/colors'

export default function FlowerColors() {
  const [colorData, setcolorData] = useState(null)
  const [shownewColorPopup, setShowNewColorPopup] = useState(false)
  const [colorToEdit, setColorToEdit] = useState(null) 
  const [searchBy, setColorSearchBy] = useState()

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

  const buttonOptions = [
    {
        text: 'Add new color', 
        action: () => setShowNewColorPopup(true), 
        minPermissionLevel: 999,
        icon: '+'
    }, 
  ]
  
  const handleClosePopup = (shouldRefresh) => {
    if(shouldRefresh) {
      fetchColors(searchBy)
    }
    setShowNewColorPopup(false)
  }

  const headers = {'Color name': 'colorname', 'Admin': ''}
  return (
    colorData && <div className='container mx-auto mt-8 p-4 text-center'>
        <AddColorPupup
          showPopup={shownewColorPopup}
          closePopup={handleClosePopup}
          editClorData={colorToEdit}
        ></AddColorPupup>
        <div className=' mb-4'>
            <h1>FlowerColors</h1>
        </div>
        
        <div className='table-container max-h-[60vh]'>
           <div className='flex items-center'>
                <label className='mr-2'> Search by name: </label>
                <input value={searchBy} onChange={(e) => setColorSearchBy(e.target.value)}></input>
            </div>
          <TableHeaderSort
            headers={headers}
          >
            {colorData.map((color, index) => {
             return <tr key={index}>
                <td>{color.colorname}</td>
                <td><button className='go-back-button' onClick={() => {handleEditColor(color)}}>Edit</button></td>
              </tr>
              
            })}

          </TableHeaderSort>
        </div>
        <FloatingMenuButton options={buttonOptions}/>

    </div>
  )
}
