import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import GoBackButton from '../../components/GoBackButton';
import RegisterUserPopup from '../../components/Popups/RegisterUserPopup';
import { useNavigate } from 'react-router-dom';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';

const USERS_URL = '/api/users/all';
const CHANGE_ROLE_URL = "/api/users/roles/changePermissions"

export default function Users() {
    
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()
    const navigateTo = useNavigate()

    const [users, setUsers] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    
    const [selectedRole, setSelectedRole] = useState(undefined);
    const [selectedUser, setSelectedUser] = useState(undefined)

    const [showRolePopup, setShwoRolePopup] = useState(false)
    const [showRegisterPopup, setShowRegisterPopup] = useState(false)

    async function getData() {
        try {
            const response = await axiosPrivate.get(USERS_URL);
            setUsers(response?.data?.users);
            setAllRoles(response?.data?.allRoles);
        } catch (error) {
            setMessage(error.response?.data?.message, true)
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    const handleChangeRole = async () => {
        if (!selectedRole) {
            return
        }
       try {
            await axiosPrivate.patch(CHANGE_ROLE_URL, JSON.stringify({newRoleid: selectedRole, userid: selectedUser}))
            setMessage('Role changed Successfully!', false)
            getData()
        } catch (error) {
            setMessage(error.response?.data?.message, true)

       }
    };

    const handleCancelPopup = async () => {
        setSelectedRole(undefined)
        setSelectedUser(undefined)
        setShwoRolePopup(false)
    }

    const handleRoleChange = async (userid) => {
        setSelectedUser(userid)
        setShwoRolePopup(true)
    }

    return (
        <div className='container mx-auto mt-8 p-4 text-center'>
            <RegisterUserPopup
                showPopup={showRegisterPopup}
                closePopup={() => setShowRegisterPopup(false)}
                continueSubmit = {() => getData()}/>
            <ConfirmationPopup showPopup ={showRolePopup} closePopup={handleCancelPopup} confirm={handleChangeRole}>
                <h1>Select new role</h1>
                <select className="mr-2 px-2 py-1 border border-gray-300 rounded" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    <option value={undefined} >Select a role</option>
                    {allRoles.map((role) => (
                        <option key={role.roleid} value={role.roleid}>
                            {role.rolename}
                        </option>
                    ))}
                </select>
            </ConfirmationPopup>
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
                            <th>ADMIN</th>
                        </tr>
                    </thead>
                    <tbody >
                        {users.map((user) => (
                            <tr key={user.userid}>
                                <td>{user.userid}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.rolename}</td>
                                <td><button className='go-back-button' onClick={() => handleRoleChange(user.userid)}>Change role</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
