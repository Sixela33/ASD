import React from 'react';
import GoBackButton from '../../components/GoBackButton';
import NewFlowerForm from '../../components/NewFlowerForm';
import { useNavigate } from 'react-router-dom';

export default function LoadFlower() {

  const navigateTo = useNavigate()
  return (
    <NewFlowerForm cancelButton={() => navigateTo('/flowers')}/>
  );
}
