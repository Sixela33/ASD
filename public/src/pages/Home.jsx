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
    { id: 5, label: 'BankStatement', url: '/bankStatement', minPermissionLevel: 1000 }
  ];

  return (
    <div className="container mx-auto p-8 flex justify-center">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ">
        {buttons.map((button) => (
          (button.url && auth?.decoded?.permissionlevel >= button.minPermissionLevel) && <Link key={button.id} to={button.url} 
          className="bg-gray-300 text-black h-[35vh] w-[35vh] max-h-[400px] max-w-[400px] flex items-center justify-center hover:bg-gray-400">
            {button.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
