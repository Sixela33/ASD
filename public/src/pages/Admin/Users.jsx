import React, { useState, useEffect, useRef, useCallback } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAlert from '../../hooks/useAlert';
import GoBackButton from '../../components/GoBackButton';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';

const USERS_URL = '/api/users/all';
const CHANGE_ROLE_URL = "/api/users/roles/changePermissions"
const GET_ROLES_URL = '/api/users/roles'

export default function Users() {
    
    const axiosPrivate = useAxiosPrivate()
    const {setMessage} = useAlert()
    const [ref, inView] = useInView({})

    const [users, setUsers] = useState([])
    const [allRoles, setAllRoles] = useState([])
    
    const [selectedRole, setSelectedRole] = useState(undefined)
    const [selectedUser, setSelectedUser] = useState(undefined)

    const [showRolePopup, setShwoRolePopup] = useState(false)

    const [searchByEmail, setSearchByEmail] = useState('')

    const offset = useRef(0)
    const dataLeft = useRef(true)
    const firstLoad = useRef(false)

    async function getRoles() {
        try {
            const response = await axiosPrivate.get(GET_ROLES_URL) 

            setAllRoles(response.data)
        } catch (error) {
            setMessage(error.response?.data?.message, true)
            console.error('Error fetching roles:', error);

        }
    }

    async function getData(searchByEmail) {
        try {
            const response = await axiosPrivate.get(USERS_URL + '?searchEmail=' + searchByEmail + '&offset=' + offset.current);
            offset.current += 1

            setUsers(prevData => [...prevData, ...response?.data?.users])
        } catch (error) {
            setMessage(error.response?.data?.message, true)
            console.error('Error fetching data:', error);
        }
    }

    const debounced = useCallback(debounce(getData, 300))

    useEffect(() => {
        if (!firstLoad.current){
            getData(searchByEmail);
            getRoles()
            firstLoad.current = true
        }
    }, []);

    useEffect(() => {
        if(inView && dataLeft.current && firstLoad.current ){
            debounced(searchByEmail)
        }
    }, [inView])

    useEffect(() => {
        if(firstLoad.current) {
            setUsers([])
            offset.current = 0
            dataLeft.current = 0
            debounced(searchByEmail)
        }
    }, [searchByEmail])

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
            <div className=' mb-4'>
                <h1>Admin</h1>
            </div>
            <div className='table-container h-[70vh]'>
                <div className='flex items-center'>
                    <label className='mr-2'> Search user by Email</label>
                    <input value={searchByEmail} onChange={(e) => setSearchByEmail(e.target.value)}></input>
                </div>
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
                        {dataLeft.current ? <tr ref={ref}><></></tr>: null}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
