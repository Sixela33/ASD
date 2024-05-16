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
    <div className="flex h-screen">
      <div className="w-[20vw] bg-black">
        <ul>
          {buttons.map((button) => (
            <li key={button.id} className="mb-2 items-center ">
              <button className="w-[20vw] p-2.5 my-2 flex items-center rounded-md px-4 cursor-pointer hover:bg-gray-700" onClick={() => setComponentToShow(button.component)}>
                <span className="text-[15px] mx-4 text-gray-200">{button.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-[80vw] mx-[5vw]">
        {componentToShow}
      </div>
    </div>
  );
}
