// Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout'


const Navbar = () => {

    const { auth } = useAuth()
    const navigate = useNavigate()
    const logout = useLogout()

    const signOut = async () => {
        await logout()
        navigate('/')
    }

    return (
        <nav className="p-4">
            <div className="container flex justify-between items-center mx-auto">
                <Link to="/" className="text-lg font-bold">
                    <img src='./asd-white.png' className="h-[10vh]" alt="ASD"></img>
                </Link>
                {console.log(auth.decoded)}
                {auth.decoded && 
                <div class="flex items-center">
                   <p class="mr-4 hover:cursor-default">{auth.decoded.username}</p>
                   <img src={auth.decoded.picture} class="rounded-full w-12 h-12 mr-5" alt="Profile Picture"/>
                   <Link onClick={signOut}>LogOut</Link>
                </div>
                }
            </div>
        </nav>
    );
};

export default Navbar;

