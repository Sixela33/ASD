import React from 'react'
import SearchableDropdown from './SearchableDropdown'
import useAxiosPrivate from '../hooks/useAxiosPrivate';

export default function AddFlowerToProjectPopup({showPopup}) {

    const axiosPrivate = useAxiosPrivate();


    return showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-2xl font-semibold mb-4">Select flower</h3>
            <SearchableDropdown options label selectedVal handleChange placeholderText InViewRef/>
        </div>
        </div>
    );
}
