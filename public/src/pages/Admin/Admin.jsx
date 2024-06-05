import React, { useState } from 'react';
import Vendors from './Vendors';
import Users from './Users';
import Clients from './Clients';
import FlowerColors from './FlowerColors';

export default function Admin() {
  const [componentToShow, setComponentToShow] = useState(<Users />);

  const buttons = [
    { id: 1, label: 'Users', component: <Users /> },
    { id: 2, label: 'Vendors', component: <Vendors /> },
    { id: 3, label: 'Clients', component: <Clients /> },
    { id: 4, label: 'Flower Colors', component: <FlowerColors /> },
  ];

  return (
    <div>
      <div className="bg-black p-4">
        <ul className="flex justify-around">
          {buttons.map((button) => (
            <li key={button.id}>
              <button className="text-white py-4 px-20 md:px-5 rounded-md hover:underline" onClick={() => setComponentToShow(button.component)} >
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
