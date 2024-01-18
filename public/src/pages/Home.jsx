import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const buttons = [
    { id: 1, label: 'Admin Page', url: '/admin' },
    { id: 2, label: 'Projects', url: '/projects' },
    { id: 3, label: 'Flowers', url: '/flowers' },
    { id: 4, label: 'Add invoice', url: '/invoice/add' },
    { id: 5, label: 'Boton 5', url: '/' },
    { id: 6, label: 'Botón 6', url: '/' },
  ];

  return (
    <div className="container mx-auto p-8 flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buttons.map((button) => (
          <Link
            key={button.id}
            to={button.url}
            className="block bg-gray-300 text-black h-[20vw] w-[20vw] flex items-center justify-center square-btn hover:bg-gray-400 focus:outline-none focus:border-none"
          >
            {button.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
