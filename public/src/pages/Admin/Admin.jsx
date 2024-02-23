import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import GoBackButton from '../../components/GoBackButton';

const USERS_URL = '/api/users/all';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const axiosPrivate = useAxiosPrivate();
    const {setMessage} = useAlert()

    useEffect(() => {
        async function getData() {
            try {
                const response = await axiosPrivate.get(USERS_URL);
                setUsers(response?.data);
            } catch (error) {
                setMessage(error.response?.data?.message, true)
                console.error('Error fetching data:', error);
            }
        }
        getData();
    }, [axiosPrivate]);

    return (
        <div className="container mx-auto mt-8">
            <div className="flex justify-between items-center mb-4">
                <GoBackButton/>
                <h1 className="text-2xl font-bold">Admin</h1>
                <Link to="/register" className="bg-black text-white font-bold py-2 px-4 rounded">Create new User</Link>
            </div>
            <div className='overflow-y-scroll max-h-[70vh]'>
                <table className="w-full table-fixed border-collapse text-center">
                    <thead className='sticky top-0 bg-white'>
                        <tr>
                            <th className="p-2">User ID</th>
                            <th className="p-2">Username</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">ADMIN</th>
                        </tr>
                    </thead>
                    <tbody >
                        {users.map((user) => (
                            <tr key={user.userid} className='bg-gray-300 border'>
                                <td className="border-b p-2 text-center">{user.userid}</td>
                                <td className="border-b p-2 text-center">{user.username}</td>
                                <td className="border-b p-2 text-center">{user.email}</td>
                                <td className="border-b p-2 text-center">
                                    <Link to={`/admin/${user.userid}`} className="mt-4 text-blue-500 hover:text-blue-700">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
