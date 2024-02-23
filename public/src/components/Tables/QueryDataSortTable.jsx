import React, {useState} from 'react';
import TableHeaderSort from './TableHeaderSort';
import { faLeftRight } from '@fortawesome/free-solid-svg-icons';

// HiChevronDown
// headers : [{Colname: objColneme1, Colname: objColneme2, ...}]
// data : {objColneme1: data, objColneme2: data, ...}, {objColneme1: data, objColneme2: data, ...}
// InViewRef: viewRef in case father has to procedurally load data
// handleSort: function to alter sorting config. it should recieve the colObjectName as a param
// sortConfig: object that dictates wich row is being used as sortin parameter. shape: { key: 'sortedBy', direction: 'asc' }
// styles: object that allows the user to customize the styles of evry component

export default function QueryDataSortTable({ headers, data, onRowClick, setSortConfig, styles, InViewRef, showViewRef, children, defaultSortConfig, sortConfig}) {

    if (!InViewRef) {
        showViewRef = false
    }

    if(typeof onRowClick !== 'function') {
        onRowClick = () => {}
    }

    if (!sortConfig){
        sortConfig = {key: '', direction: 'asc' }
    }

    const defaultStyles = {
        trStyles: "bg-gray-300 border",
    };

    const mergedStyles = {
        trStyles: `${defaultStyles.trStyles} ${styles?.trStyles || ''}`,
    };

    return (
        <TableHeaderSort
            headers={headers} 
            setSortConfig={setSortConfig}
            styles={mergedStyles}
            sortConfig={sortConfig} 
            children={children} 
            defaultSortConfig={defaultSortConfig}
            >
                {data.map((item, rowIndex) => (
                    <tr key={rowIndex} className={mergedStyles.trStyles} onClick={() => onRowClick(item)}>
                        {Object.keys(headers).map((colData, colIndex) => (
                            <td key={`${rowIndex}-${colIndex}`} className="p-2">
                                {item[headers[colData]]}
                            </td>
                        ))}
                    </tr>
                ))}
                
                {showViewRef && (
                    <tr>
                        {Object.keys(headers).map((obj, colIndex) => (
                            <td key={`vr-${colIndex}`} ref={InViewRef} className="border p-2"> Loading </td>
                        ))}
                    </tr>
                )}
        </TableHeaderSort>
    
    );
}