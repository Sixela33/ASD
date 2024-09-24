import React, { useEffect, useState } from 'react'
import PopupBase from '../PopupBase'

export default function MoveFlowerFromProjectPopup({ showPopup, closePopup, projectsList, flowerData, selectedRow, selectedIndexes, CHOSEN_PROJECTS_SORTED}) {
    const [selectedProject, setSelectedProject] = useState(selectedRow)

    const moveFlowersFromProject = () => {
        // Filter flowers to move from the current project
        const flowersToMove = flowerData[selectedRow].filter((item, index) => selectedIndexes.includes(index))

        // Remove the flowers from the original project
        flowerData[selectedRow] = flowerData[selectedRow].filter((item, index) => !selectedIndexes.includes(index))

        const updatedFlowers = flowersToMove.map(flower => ({
            ...flower,
            projectid: CHOSEN_PROJECTS_SORTED[selectedProject] // Assuming projectId is what you meant
        }))

        // Add the flowers to the new selected project
        flowerData[selectedProject] = [...flowerData[selectedProject], ...updatedFlowers]

        closePopup()
    }

    useEffect(() => {
        setSelectedProject(selectedRow)
    },[selectedRow])

    return (
        <PopupBase
            showPopup={showPopup}
            closePopup={closePopup}
            maxw='[50%]'
        >
            <div className="space-y-6">
                <h1 className="text-xl font-bold mb-4">Choose which project you want to move these flowers to</h1>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                {['Client', 'Description', 'Date', 'selected'].map((name, index) => (
                                    <th key={index} className="p-2">{name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="max-h-64 overflow-y-auto">
                            {projectsList?.map((item, index) => (
                                <tr key={index} onClick={() => setSelectedProject(index)} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="p-2">{item?.projectclient}</td>
                                    <td className="p-2">{item?.projectdescription}</td>
                                    <td className="p-2">{item?.projectdate}</td>
                                    <td className="p-2">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedProject === index} 
                                            readOnly
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 className="text-lg font-semibold mt-6 mb-2">Flowers in Selected Project</h2>
                <div className="overflow-x-auto">
                    <table className="w-full"> 
                        <thead>
                            <tr className="bg-gray-100">
                                {['Flower name', 'Recipe stems', 'Stems Bought', 'Unit price'].map((name, index) => (
                                    <th key={index} className="p-2">{name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="max-h-64 overflow-y-auto">
                            {flowerData[selectedRow]?.filter((item, index) => selectedIndexes.includes(index)).map((flower, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="p-2">{flower?.flowername}</td>
                                    <td className="p-2">{flower?.totalstems}</td>
                                    <td className="p-2">{flower?.numstems}</td>
                                    <td className="p-2">${flower?.unitprice}</td> 
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='butons-holder'>
                    <button onClick={closePopup} className="buton-secondary">Cancel</button>
                    <button onClick={moveFlowersFromProject} className="buton-main">Change project</button>
                </div>
            </div>
        </PopupBase>
    )
}