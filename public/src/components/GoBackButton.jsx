import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function GoBackButton() {
    const navigateTo = useNavigate();

  return (
    <button onClick={() => navigateTo(-1)} className="text-blue-500 hover:text-blue-700">go back</button>
  )
}
