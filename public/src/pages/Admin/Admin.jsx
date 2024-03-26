import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function Admin() {
  const navigateTo = useNavigate();


  const buttons = [
    { id: 1, label: 'Users', url: '/admin/users' },
    { id: 2, label: 'Vendors', url: '/admin/vendors' },
    { id: 3, label: 'Clients', url: '/admin/clients' },
  ];

  return (
    <div className='container mx-auto p-8 '>
        <div className='grid grid-row grid-cols-3 my-3 text-center'>
          <button onClick={() => navigateTo('/')} className='go-back-button col-span-1'>Go Back</button>
          <h1 className='col-span-1'>Admin Page</h1>
        </div>
      <div className=" flex justify-center grid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grid-row">
          {buttons.map((button) => (
            button.url != '/' && <Link key={button.id} to={button.url} 
            className="block bg-gray-300 text-black h-[20vw] w-[20vw] flex items-center justify-center square-btn hover:bg-gray-400 focus:outline-none focus:border-none">
              {button.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}