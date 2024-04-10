import React from 'react'
import useAuth from '../hooks/useAuth'

export default function RestrictedComponent({permissionRequired, children}) {
    const {auth} = useAuth()


    return (
        <>
        {auth?.decoded?.permissionlevel >= permissionRequired ? children : <></>}
        </>
    )
}
