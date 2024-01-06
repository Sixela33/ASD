import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';

const USER_URL = 'api/users/search/';
const ADD_ROLE_URL = "/api/users/roles/give"
const REMOVE_ROLE_URL = "/api/users/roles/removePermission"

export default function User() {
    const { userid } = useParams();
    const axiosPrivate = useAxiosPrivate();
    
    const [userData, setUserData] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [reloadPage, setReload] = useState(false)

    const {setMessage} = useAlert()

    useEffect(() => {
        async function getData() {
            try {
                const response = await axiosPrivate.get(USER_URL + userid);
                setUserData(response?.data?.user[0]);
                setUserRoles(response?.data?.roles);
                setAllRoles(response?.data?.allRoles);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        getData();
    }, [reloadPage]);

    const handleAddRole = async () => {
        if (selectedRole && !userRoles.includes(selectedRole)) {
            const role = allRoles.find(role => role.rolename === selectedRole)
            try {
                const response = await axiosPrivate.post(ADD_ROLE_URL, JSON.stringify({userid: userid, roleid: role.roleid}))
                setMessage("Agregado con exito", false)
                setReload(!reloadPage)

            } catch (error) {
                console.log(error)
                setMessage(error?.response?.data?.message, true)
            }
        }
    };

    const handleRemoveRole = async (localSelectedRole) => {

        if (localSelectedRole && userRoles.includes(localSelectedRole)) {
            const role = allRoles.find(role => role.rolename === localSelectedRole)
            console.log(role)
            try {
                const response = await axiosPrivate.patch(REMOVE_ROLE_URL, JSON.stringify({userid: userid, roleid: role.roleid}))
                console.log(response)
                setMessage("Eliminado con exito", false)
                setReload(!reloadPage)

            } catch (error) {
                console.log(error)
                setMessage(error?.response?.data?.message, true)
            }
            
        }
    };

    return (
        <div className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-md">
        {userData && (
            <div>
                <Link to='/admin' className="mt-4 text-blue-500 hover:text-blue-700">go back</Link>
                <h1 className="text-2xl font-bold mb-4">User Profile - {userData.username}</h1>
                <p className="text-gray-600">Email: {userData.email}</p>

                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">User Roles</h2>
                    <ul className="list-disc pl-6">
                        {userRoles.map((role) => (
                            <li key={role} className="text-gray-700 flex items-center">
                                <span>{role}</span>
                                <button className="ml-2 text-red-500" onClick={() => handleRemoveRole(role)}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">All Roles</h2>
                    <div className="flex items-center">
                        <select className="mr-2 px-2 py-1 border border-gray-300 rounded" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                            <option value="" disabled>Select a role</option>
                            {allRoles.map((role) => (
                                <option key={role.roleid} value={role.rolename}>
                                    {role.rolename}
                                </option>
                            ))}
                        </select>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleAddRole}>
                            Add Role
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
}
