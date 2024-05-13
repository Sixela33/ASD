import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import TableHeaderSort from '../../components/Tables/TableHeaderSort'
import AddColorPupup from '../../components/Popups/AddColorPupup'
import FloatingMenuButton from '../../components/FloatingMenuButton/FloatingMenuButton'

const GET_COLORS_URL = '/api/flowers/colors'

export default function FlowerColors() {
  const [colorData, setcolorData] = useState(null)
  const [shownewColorPopup, setShowNewColorPopup] = useState(false)
  const [colorToEdit, setColorToEdit] = useState(null) 

  const axiosPrivate = useAxiosPrivate()

  const fetchColors = async () => {
    try {
      const response = await axiosPrivate.get(GET_COLORS_URL)
      console.log("response",response)
      setcolorData(response.data)
    } catch (error) {
      console.log(error)
      setMessage(error.response?.data)            
    }
  }

  useEffect(() => {
    fetchColors()
  }, [])

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
      fetchColors()
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
        
        <div className='table-container h-[70vh]'>
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
