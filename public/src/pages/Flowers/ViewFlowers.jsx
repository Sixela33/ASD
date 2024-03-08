import React from 'react';
import { Link } from 'react-router-dom';
import FlowerListComponent from '../../components/FlowerListComponent';
import { useNavigate } from 'react-router-dom';

export default function ViewFlowers() {
    const navigateTo = useNavigate()

    const onFlowerClick = (flower) => {
        navigateTo('/flowers/' + flower.flowerid)
    }

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>
            <div className='title-container'>
                <button onClick={() => navigateTo('/')} className='go-back-button'>go back</button>
                <h1>Flower Catalog</h1>
                <Link to="/flowers/create" className='buton-main'>Add new flower</Link>
            </div>

            <FlowerListComponent  styles={{ maxHeight: '70vh' }} onFlowerClick={onFlowerClick} />

            
        </div>
    );
};

