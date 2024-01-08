import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"

import axios from '../api/axios';
const LOGIN_URL = '/api/users/login';

const Login = () => {
    const { setAuth, persist, setPersist } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        //userRef.current.focus();
    }, [])

    useEffect(() => {
        setError('');
    }, [email, password])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all the required fields.")
            return
        }
        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ email, password }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            //console.log(JSON.stringify(response));
            //console.log("RESPONSE: ", response)
            const accessToken = response?.data?.accessToken;
            const userRoles = response?.data?.userRoles
            //const roles = response?.data?.roles;
            if (accessToken) {
                const decoded = jwtDecode(accessToken)
                console.log(decoded)
                setAuth({decoded, accessToken, userRoles})
            }
            setEmail('');
            setPassword('');
            navigate(from, { replace: true });

        } catch (error) {
                setError(error.response.data);
            
            errRef.current.focus();
        }
    }

    const togglePersist = () => {
        setPersist(prev => !prev);
    }

    useEffect(() => {
        localStorage.setItem("persist", persist);
    }, [persist])

    return (

        <section className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="mb-8 text-3xl font-bold">Log In</h1>
        <p ref={errRef} className={error ? 'errmsg mt-4' : 'offscreen'} aria-live="assertive">{error}</p>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-4">
            <label className="block text-lg mb-1">Email:</label>
            <input className="w-full px-4 py-3 bg-gray-300 rounded-md text-lg focus:outline-none focus:border-blue-400" type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="mb-4">
            <label className="block text-lg mb-1">Password:</label>
            <input className="w-full px-4 py-3 bg-gray-300 rounded-md text-lg focus:outline-none focus:border-blue-400" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-400 focus:outline-none focus:border-none" type="submit">Login</button>
          <div className="persistCheck mt-4">
            <input type="checkbox" id="persist" onChange={togglePersist} checked={persist}/>
            <label htmlFor="persist">Trust This Device</label>
          </div>
        </form>
        <Link to="/changePass" className="mt-4 text-blue-500 hover:text-blue-700">Forgot Password?</Link>
      </section>

    )
}

export default Login
