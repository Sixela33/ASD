const sortData = (data, sortConfig) => {
    if (!data) return [] 
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

export {sortData}