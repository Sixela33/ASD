import axios from "../api/axios";
import useAuth from "./useAuth";

// This is just a hook to log out the user (removes the cookie and the token from the svs database)
const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        setAuth({});
        try {
            const response = await axios('api/users/logout', {
                withCredentials: true
            });
        } catch (err) {
            console.error(err);
        }
    }

    return logout;
}

export default useLogout