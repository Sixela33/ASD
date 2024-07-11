import React, { useState } from 'react';
import Vendors from './Vendors';
import Users from './Users';
import Clients from './Clients';
import FlowerColors from './FlowerColors';
import Contacts from './Contact';

export default function Admin() {
  const [componentToShow, setComponentToShow] = useState(<Users />);

  const buttons = [
    { id: 1, label: 'Users', component: <Users /> },
    { id: 2, label: 'Vendors', component: <Vendors /> },
    { id: 3, label: 'Clients', component: <Clients /> },
    { id: 4, label: 'Contacts', component: <Contacts /> },
    { id: 5, label: 'Flower Colors', component: <FlowerColors /> },
  ];

  return (
    <div>
      <div className="bg-black p-4">
        <ul className="flex flex-wrap justify-around  md:space-x-4">
          {buttons.map((button) => (
            <li key={button.id} className="my-2">
              <button 
                className="text-white py-2 px-4 md:px-5 rounded-md hover:underline" 
                onClick={() => setComponentToShow(button.component)}
              >
                {button.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="container mx-auto my-8">
        {componentToShow}
      </div>
    </div>
  );
}
