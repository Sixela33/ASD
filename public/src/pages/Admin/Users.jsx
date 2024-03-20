import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import GoBackButton from '../../components/GoBackButton';
import RegisterUserPopup from '../../components/Popups/RegisterUserPopup';
import { useNavigate } from 'react-router-dom';

const USERS_URL = '/api/users/all';

export default function Users() {
    
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()
    const navigateTo = useNavigate()

    const [users, setUsers] = useState([]);
    const [showRegisterPopup, setShowRegisterPopup] = useState(false)

    async function getData() {
        try {
            const response = await axiosPrivate.get(USERS_URL);
            setUsers(response?.data);
        } catch (error) {
            setMessage(error.response?.data?.message, true)
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>
            <RegisterUserPopup
                showPopup={showRegisterPopup}
                closePopup={() => setShowRegisterPopup(false)}
                continueSubmit = {() => getData()}/>
            <div className='grid grid-cols-3 mb-4'>
                <GoBackButton className='col-span-1'/>
                <h1 className='col-span-1'>Admin</h1>
                <button onClick={() => {setShowRegisterPopup(true)}} className='buton-main col-span-1 mx-auto'>Create new User</button>
            </div>
            <div className='table-container h-[70vh]'>
                <table>
                    <thead >
                        <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>User role</th>
                        </tr>
                    </thead>
                    <tbody >
                        {users.map((user) => (
                            <tr key={user.userid} onClick={() => navigateTo(`/admin/users/${user.userid}`)}>
                                <td>{user.userid}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.rolename}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
