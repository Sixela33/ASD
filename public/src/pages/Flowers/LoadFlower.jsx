import React from 'react';
import GoBackButton from '../../components/GoBackButton';
import NewFlowerForm from '../../components/NewFlowerForm';
import { useNavigate } from 'react-router-dom';

export default function LoadFlower() {

  const navigateTo = useNavigate()
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-md shadow-md">
      <GoBackButton/>
      <NewFlowerForm cancelButton={() => navigateTo('/flowers')}/>
    </div>
  );
}
