import React, { useEffect, useRef } from 'react';
import useAlert from '../hooks/useAlert';

export default function Alert() {
    const { message, isError, closeAlert } = useAlert();
    const alertRef = useRef(null)
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (message && alertRef.current && !alertRef.current.contains(e.target)) {
                closeAlert();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        const timer = setTimeout(() => {
            closeAlert();
        }, 5000);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearTimeout(timer)
        };
    }, [message]);

    if (!message) {
        return null;
    }

    const alertClass = `${isError ? 'bg-blue-500' : 'bg-green-500'} fixed top-10 right-1/2 transform translate-x-1/2 w-1/2 z-50 flex items-center text-white text-sm font-bold px-4 py-3 alert-container`;

    return (
        <div className={alertClass} ref={alertRef} role="alert">
            <p>{message}</p>
            <button className="ml-auto text-white-500" onClick={closeAlert}>X</button>
        </div>
    );
}
