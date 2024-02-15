import React from 'react'
import BaseTable from '../components/Tables/BaseTable'

export default function Test() {

    const tempData = [{'col1': "Hola!", 'col2': "chau", 'col3': ":("}, {'col1': "Hola!", 'col2': "chau", 'col3': ":("}]
    const tempCols = [{'saludo': "col1"}, {'saludo2': "col2"}, {'animo': "col3"}]
    return (
        <div>
            <BaseTable 
                data={tempData}
                headers={tempCols}
            />
        </div>
    )
}
