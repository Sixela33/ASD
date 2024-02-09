import React from 'react'
import { useLocation } from 'react-router-dom'

export default function ArrangementCreation() {
    const arrangementData = location?.state

    return (
        <div>
            {JSON.stringify(arrangementData)}
        </div>
    )
}
