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
    <div className="flex min-h-[90vh]">
      <div className="w-64 bg-black text-white p-4">
        <ul className="space-y-2">
          {buttons.map((button) => (
            <li key={button.id}>
              <button
                className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700"
                onClick={() => setComponentToShow(button.component)}
              >
                {button.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-8">
        {componentToShow}
      </div>
    </div>
  );
}
