import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAlert from "../hooks/useAlert";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();
    const {setMessage} = useAlert()
    
    const thing = () => {
        setMessage('Unauthorised')
        return <Navigate to="/" state={{ from: location }} replace />
    } 

    //console.log("auth", auth)
    // console.log("allowedRoles", allowedRoles)
    return (
        auth?.decoded?.permissionlevel >= allowedRoles
            ? <Outlet />
            : auth?.accessToken //changed from user to accessToken to persist login after refresh
                ? thing()
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;