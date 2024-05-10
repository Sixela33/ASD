import React, { useState } from 'react';
import Vendors from './Vendors';
import Users from './Users';
import Clients from './Clients';

export default function Admin() {
  const [componentToShow, setComponentToShow] = useState(<Users />);
  const buttons = [
    { id: 1, label: 'Users', component: <Users /> },
    { id: 2, label: 'Vendors', component: <Vendors /> },
    { id: 3, label: 'Clients', component: <Clients /> },
  ];

  return (
    <div className='flex page'>
      <div className=" p-2 w-[300px] overflow-y-auto bg-black ">
        <div className="text-gray-100 text-xl">
          <div>
            {buttons.map(button => {
              return (
                <div key={button.id} className="p-2.5 mt-2 flex items-center rounded-md px-4 cursor-pointer hover:bg-gray-700" onClick={() => setComponentToShow(button.component)}>
                  <span className="text-[15px] ml-4 text-gray-200">{button.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 mx-[5vw]">{componentToShow}</div>
    </div>
  );
}
