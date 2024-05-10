import React, { useState } from 'react';
import FlowerListComponent from '../../components/FlowerListComponent';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { permissionsRequired } from '../../utls/permissions';
import useAlert from '../../hooks/useAlert';
import NewFlowerForm from '../../components/NewFlowerForm';

export default function ViewFlowers() {
    const navigateTo = useNavigate()
    const { auth } = useAuth();
    const { setMessage } = useAlert()
    const user = auth.decoded

    const [showNewFlowerPoupu, setShowNewFlowerPupup] = useState(false)
    const [refreshVariable, setRefreshVariable] = useState(false)

    const onFlowerClick = (flower) => {
        if(!(user.permissionlevel >= permissionsRequired['veiw_flower_statistics'])) return
        navigateTo('/flowers/' + flower.flowerid)
    }

    const onCreateNewFlower = () => {
        if(!user.permissionlevel >= permissionsRequired['veiw_flower_statistics']) {
            setMessage('insufficient permissions')
            return
        }
        setShowNewFlowerPupup(true)
    } 

    return (
        <div className='container mx-auto pt-12 p-4 text-center page'>
            <div className='grid grid-cols-3 mb-4'>
                <button onClick={() => navigateTo('/')} className='go-back-button col-span-1'>Go Back</button>
                <h1 className='col-span-1'>Flower Catalog</h1>
                <button className={`buton-main col-span-1 mx-auto`} onClick={onCreateNewFlower}>Add new flower</button>
            </div>
            <NewFlowerForm 
                showPopup={showNewFlowerPoupu}
                cancelButton={() => setShowNewFlowerPupup(false)}
                title={'Add Flower'}
                refreshData={() => setRefreshVariable(!refreshVariable)}/>
            <FlowerListComponent  styles={{ maxHeight: '65vh' }} onFlowerClick={onFlowerClick} refresh={refreshVariable}/>
        </div>
    );
};

