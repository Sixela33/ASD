import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const { auth } = useAuth();

  const buttons = [
    { id: 1, label: 'Admin Page', url: '/admin', minPermissionLevel: 2000 },
    { id: 2, label: 'Projects', url: '/projects', minPermissionLevel: 1 },
    { id: 3, label: 'Flowers', url: '/flowers', minPermissionLevel: 1 },
    { id: 4, label: 'Invoices', url: '/invoice', minPermissionLevel: 1000 },
  ];

  return (
    <div className="container mx-auto p-8 flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buttons.map((button) => (
          (button.url && auth?.decoded?.permissionlevel >= button.minPermissionLevel) && <Link key={button.id} to={button.url} 
          className="block bg-gray-300 text-black h-[20vw] w-[20vw] flex items-center justify-center square-btn hover:bg-gray-400 focus:outline-none focus:border-none">
            {button.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
