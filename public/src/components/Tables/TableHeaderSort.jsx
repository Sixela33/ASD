import React from 'react';
import { HiChevronDown } from "react-icons/hi";

// HiChevronDown
// headers : [{Colname: objColneme1, Colname: objColneme2, ...}]
// data : {objColneme1: data, objColneme2: data, ...}, {objColneme1: data, objColneme2: data, ...}
// InViewRef: viewRef in case father has to procedurally load data
// handleSort: function to alter sorting config. it should recieve the colObjectName as a param
// sortConfig: object that dictates wich row is being used as sortin parameter. shape: { key: 'sortedBy', direction: 'asc' }
// styles: object that allows the user to customize the styles of evry component


export default function TableHeaderSort({ headers, setSortConfig, defaultSortConfig, sortConfig, children, styles }) {

    if (!sortConfig){
        sortConfig = {key: '', direction: 'asc' }
    }

    if (!headers) headers={}

    if (!setSortConfig) setSortConfig = () => {}

    const defaultStyles = {
        theadStyles: "sticky top-0 bg-white hover:cursor-pointer",
        tbodyStyles: "",
        tableStyles: "w-full table-fixed border-collapse text-center",
    };

    const mergedStyles = {
        tbodyStyles: `${defaultStyles.tbodyStyles} ${styles?.tbodyStyles || ''}`,
        theadStyles: `${defaultStyles.theadStyles} ${styles?.theadStyles || ''}`,
        tableStyles: `${defaultStyles.tableStyles} ${styles?.tableStyles || ''}`,
    };

    let handleSort = (key) => {
        let direction = 'asc';
        if(key== '') return
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc'){
                direction = 'desc';
            } else{
                key = defaultSortConfig.key
                direction = defaultSortConfig.direction
            }
        }
        setSortConfig({ key, direction });
    };
    
    return (
    <table className={mergedStyles.tableStyles}>
        <thead className={mergedStyles.theadStyles}>
            <tr>
                {Object.keys(headers).map((colData, index) => (
                    <th key={index}  onClick={() => handleSort(headers[colData])}>
                        <div className="flex items-center justify-center">
                            <span>{colData}</span>
                            {sortConfig.key === headers[colData] &&
                                <div className={`ml-1 ${sortConfig.direction === 'asc' ? "rotate-180" : ""}`}>
                                    <HiChevronDown />
                                </div>
                            }
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
        <tbody className={mergedStyles.tbodyStyles}>
            {children}
        </tbody>
    </table>

    );
}