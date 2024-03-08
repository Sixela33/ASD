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

const defaultSortConfig = { key: null, direction: 'asc' }

export default function LocalDataSortTable({ headers, data, onRowClick, children, styles, InViewRef, showViewRef}) {
    let [sortConfig, setSortConfig] = useState(defaultSortConfig);

    if (!data) data =[]

    let sortedData = () => {
      let sortableData = [...data];
      if (sortConfig.key) {
          sortableData.sort((a, b) => {
              const key = sortConfig.key;
              if (a[key] < b[key]) {
                  return sortConfig.direction === 'asc' ? -1 : 1;
              }
              if (a[key] > b[key]) {
                  return sortConfig.direction === 'asc' ? 1 : -1;
              }
              return 0;
          });
      }
      return sortableData;
  };

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
        tbodyStyles: "",
        trStyles: "bg-gray-300 border",
    };

    const mergedStyles = {
        tbodyStyles: `${defaultStyles.tbodyStyles} ${styles?.tbodyStyles || ''}`,
        trStyles: `${defaultStyles.trStyles} ${styles?.trStyles || ''}`,
    };

    return (
        <TableHeaderSort
            headers={headers} 
            sortConfig={sortConfig} 
            children={children} 
            styles={mergedStyles}
            setSortConfig={setSortConfig}
            defaultSortConfig = {defaultSortConfig}
            >
                {sortedData().map((item, rowIndex) => (
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
                            <td key={`vr-${colIndex}`} ref={InViewRef} > Loading </td>
                        ))}
                    </tr>
                )}
        </TableHeaderSort>
    
    );
}