import { createContext, useState } from "react";

const AlertContext = createContext({});

export const AlertProvider = ({ children }) => {
    const [message, _setMessage] = useState(null);
    const [isError, setIsError] = useState(true);

    const closeAlert = () => {
        console.log("closing alert")
        _setMessage(null)
    }

    const setMessage = (_message, _isError=true) => {
        console.log(_message)
        _setMessage(_message)
        setIsError(_isError)
    }

    return (
        <AlertContext.Provider value={{ message, setMessage, isError, closeAlert }}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContext