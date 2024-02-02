import React, { useEffect, useRef } from 'react';
import useAlert from '../hooks/useAlert';

export default function Alert() {
    const { message, isError, closeAlert } = useAlert();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (message && !event.target.closest('.alert-container')) {
                console.log(event)
                closeAlert();
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [message]);

    if (!message) {
        return null;
    }

    const alertClass = `fixed top-10 right-1/2 transform translate-x-1/2 w-1/2 z-50 flex items-center ${isError ? 'bg-red-500' : 'bg-green-500'} text-white text-sm font-bold px-4 py-3 alert-container`;

    return (
        <div className={alertClass} role="alert">
            <p>{message}</p>
            <button className="ml-auto text-white-500" onClick={closeAlert}>X</button>
        </div>
    );
}
