// Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout'
import { useLocation } from 'react-router-dom';

const Navbar = () => {

    const { auth } = useAuth()
    const navigate = useNavigate()
    const logout = useLogout()
    const location = useLocation()

    const signOut = async () => {
        await logout()
        navigate('/')
    }

    const imageHeight = "h-[10vh]"
    
    return (
        <nav className="p-4">
            <div className="container flex justify-between items-center mx-auto">
                {location.pathname != "/login" ? 
                    <Link to="/" className="text-lg font-bold">
                        <img src='./asd-white.png' className={imageHeight} alt="ASD"></img>
                    </Link> 
                    : <div className={imageHeight}/>
                }

                {auth.decoded && 
                    <div className="flex items-center">
                        <p className="mr-4 hover:cursor-default">{auth.decoded.username}</p>
                        <img src={auth.decoded.picture} className="rounded-full w-12 h-12 mr-5" alt="Profile Picture"/>
                        <Link onClick={signOut} className='hover:underline pl-5'>LogOut</Link>
                    </div>
                }
            </div>
        </nav>
    );
};

export default Navbar;

