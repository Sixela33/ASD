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
        <div className="container mx-auto my-4">
            <div className="flex justify-between mb-4">
                <button onClick={() => navigateTo('/')} className="text-blue-500 hover:text-blue-700">go back</button>

                <Link to="/flowers/create" className="bg-black text-white font-bold py-2 px-4 rounded">Add new flower</Link>
            </div>

            <FlowerListComponent  styles={{ maxHeight: '70vh' }} onFlowerClick={onFlowerClick} />

            
        </div>
    );
};

