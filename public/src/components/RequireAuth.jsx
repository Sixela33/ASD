import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAlert from "../hooks/useAlert";
import ROLES_LIST from "../../../config/rolesList";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();
    const {setMessage} = useAlert()
    
    const thing = () => {
        setMessage('You need more permissions to perform this action', true)
        return <Navigate to="/" state={{ from: location }} replace />
    } 

    if (auth?.decoded?.permissionlevel == undefined) {
        return <Navigate to='/login'/>
    }

    if(auth?.decoded?.permissionlevel == ROLES_LIST['Inactive'] ) {
        return <Navigate to='/inactive'/>
    }


    return (
        auth?.decoded?.permissionlevel >= allowedRoles
            ? <Outlet />
            : auth?.accessToken //changed from user to accessToken to persist login after refresh
                ? thing()
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;