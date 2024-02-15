import React, { useState, useEffect } from 'react';
import { HiChevronDown } from "react-icons/hi";

// HiChevronDown
// headers : [{Colname: objColneme1, Colname: objColneme2, ...}]
// data : {objColneme1: data, objColneme2: data, ...}, {objColneme1: data, objColneme2: data, ...}
// InViewRef: viewRef in case father has to procedurally load data
// handleSort: function to alter sorting config. it should recieve the colObjectName as a param
// sortConfig: object that dictates wich row is being used as sortin parameter. shape: { key: 'sortedBy', direction: 'asc' }
export default function QueryBaseTable({ data, headers, InViewRef, handleSort, onRowClick, sortConfig, children }) {
    const [showViewRef, setShowViewRef] = useState(true);
    useEffect(() => {
        if (!InViewRef) {
            setShowViewRef(false);
        }
        
    }, []);

    if (typeof handleSort !== 'function') {
        handleSort = () => {}
    }

    if(typeof onRowClick !== 'function') {
        onRowClick = () => {}
    }

    if (!sortConfig){
        sortConfig = {key: '', direction: 'asc' }
    }

    return (
        <table className="w-full table-fixed border-collapse">
            <thead>
                <tr>
                    {Object.keys(headers).map((colData, index) => (
                        <th key={index} className="border p-2" onClick={() => handleSort(headers[colData])}>
                            {colData}
                            {sortConfig.key == headers[colData] &&
                                <div className={`absolute  ${sortConfig.direction == 'asc' ? "rotate-180" : ""}`}>
                                    <HiChevronDown />
                                </div>
                            }
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, rowIndex) => (
                    <tr key={rowIndex} className="bg-gray-300 border">
                        {Object.keys(headers).map((colData, colIndex) => (
                            <td key={`${rowIndex}-${colIndex}`} className=" p-2" onClick={() => onRowClick(colData)}>
                                {item[headers[colData]]}
                            </td>
                        ))}
                    </tr>
                ))}
                {children }
                {showViewRef && (
                    <tr>
                        {Object.keys(headers).map((obj, colIndex) => (
                            <td key={`vr-${colIndex}`} ref={InViewRef} className="border p-2"> Loading </td>
                        ))}
                    </tr>
                )}
            </tbody>
        </table>
    );
}