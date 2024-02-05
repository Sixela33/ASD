// Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout'


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { auth } = useAuth()
    const navigate = useNavigate()
    const logout = useLogout()

    const signOut = async () => {
        await logout()
        navigate('/')
    }
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    //console.log(auth)

    return (
        <nav className="bg-black p-4">
        <div className="container flex justify-between items-center">
            <Link to="/" className="text-white text-lg font-bold">
                <img src='./asd.png' className="h-20" alt="ASD"></img>
            </Link>
            <div className="lg:hidden">
                <button onClick={toggleMenu} className="text-white focus:outline-none focus:border-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
            </div>

            <p className='text-white'>{auth && auth?.decoded?.username}</p>
            <div className={`lg:flex ${isOpen ? 'flex' : 'hidden'} items-center space-x-4`}>
                {auth?.userRoles && <Link onClick={signOut} className="text-white">LogOut</Link>}
            </div>
        </div>
        </nav>
    );
};

export default Navbar;

