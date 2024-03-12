import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import GoBackButton from '../../components/GoBackButton';
import RegisterUserPopup from '../../components/Popups/RegisterUserPopup';

const USERS_URL = '/api/users/all';

export default function Users() {
    
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()
    
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
                closePopup={() => setShowRegisterPopup(false)}/>
            <div className='title-container'>
                <GoBackButton/>
                <h1 >Admin</h1>
                <button onClick={() => {setShowRegisterPopup(true)}} className='buton-main '>Create new User</button>
            </div>
            <div className='table-container h-[70vh]'>
                <table>
                    <thead >
                        <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>User role</th>
                            <th>ADMIN</th>
                        </tr>
                    </thead>
                    <tbody >
                        {users.map((user) => (
                            <tr key={user.userid} >
                                <td >{user.userid}</td>
                                <td >{user.username}</td>
                                <td >{user.email}</td>
                                <td >{user.rolename}</td>
                                <td >
                                    <Link to={`/admin/${user.userid}`} className='go-back-button'>Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
