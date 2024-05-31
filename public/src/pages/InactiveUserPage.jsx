import React from 'react';

export default function InactiveUserPage() {
  return (
    <div className="container mx-auto mt-8 p-4 text-center">
        <h1>Welcome!</h1>
        <h2>
          Your account is inactive at the moment. Please contact a system
          administrator to grant you access.
        </h2>
        <a href='/'>Go to home</a>
    </div>
  );
}
