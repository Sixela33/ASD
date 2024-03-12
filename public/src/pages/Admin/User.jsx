import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import { redirect } from 'react-router-dom';
import GoBackButton from '../../components/GoBackButton';
//import PopupBase from '../../components/PopupBase';
import ConfirmationPopup from '../../components/Popups/ConfirmationPopup';

const USER_URL = 'api/users/search/';
const ADD_ROLE_URL = "/api/users/roles/give"
const CHANGE_ROLE_URL = "/api/users/roles/changePermissions"

export default function User() {
    const { userid } = useParams();
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()
    
    const [userData, setUserData] = useState(null);
    const [allRoles, setAllRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(undefined);
    const [reloadPage, setReload] = useState(false)
    const [showRolePopup, setShwoRolePopup] = useState(false)

    const getData = async () => {
        try {
            const response = await axiosPrivate.get(USER_URL + userid);
            console.log(response.data)
            setUserData(response?.data?.user[0]);
            setAllRoles(response?.data?.allRoles);
        } catch (error) {
            setMessaguserDatae(error.response?.data?.message, true)
            redirect('/admin')
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
            const response = await axiosPrivate.patch(CHANGE_ROLE_URL, JSON.stringify({newRoleid: selectedRole, userid: userData.userid}))
            setMessage('Role changed Successfully!', false)
            getData()
        } catch (error) {
            setMessage(error.response?.data?.message, true)

       }
    };

    const handleCancelPopup = async () => {
        setSelectedRole('')
        setShwoRolePopup(false)
    }

    const handleRemoveRole = async (localSelectedRole) => {

    
    };

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
            <div className='title-container'>
                <GoBackButton/>
                <h1>User Profile</h1>
                <p></p>
            </div>
        {userData && (
            <div>
                <p >User Name: {userData.username}</p>
                <p className="text-gray-600">Email: {userData.email}</p>

                <div className="mt-6">
                    <p >User Role: {userData.rolename}</p>
                    <button className='buton-secondary' onClick={() => {setShwoRolePopup(true)}}>Change Role</button>
                </div>
            </div>
        )}
    </div>
    );
}
