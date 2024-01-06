import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';

const USERS_URL = '/api/users/all';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const axiosPrivate = useAxiosPrivate();



    useEffect(() => {
        async function getData() {
            try {
                const response = await axiosPrivate.get(USERS_URL);
                setUsers(response?.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        getData();
    }, [axiosPrivate]);

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Admin</h1>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr>
                        <th className="border-b p-2">User ID</th>
                        <th className="border-b p-2">Username</th>
                        <th className="border-b p-2">Email</th>
                        <th className="border-b p-2">Created At</th>
                        <th className="border-b p-2">Last Edit</th>
                        <th className="border-b p-2">ADMIN</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.userid}>
                            <td className="border-b p-2 text-center">{user.userid}</td>
                            <td className="border-b p-2 text-center">{user.username}</td>
                            <td className="border-b p-2 text-center">{user.email}</td>
                            <td className="border-b p-2 text-center">{user.createdat}</td>
                            <td className="border-b p-2 text-center">{user.lastedit}</td>
                            <td className="border-b p-2 text-center">
                                <Link to={`/admin/${user.userid}`} className="mt-4 text-blue-500 hover:text-blue-700">Edit</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
