import React, {useState} from 'react'
import QueryBaseTable from './QueryBaseTable';

export default function BaseTable({data, headers, onRowClick, children}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = () => {
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

  return (
    <QueryBaseTable
        data={sortedData()}
        headers={headers}
        handleSort={handleSort}
        onRowClick = {onRowClick}
        sortConfig = {sortConfig}
    >
      {children}
    </QueryBaseTable>
  )
}
