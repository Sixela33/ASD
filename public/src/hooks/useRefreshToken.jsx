import axios from '../api/axios';
import useAuth from './useAuth';
import { jwtDecode } from "jwt-decode"

// This hook keeps the user logged in when refreshing the page. all the user info is stored in local storage to maximize security
// A http only cookie is used to store a refresh token that allows the page to get the user info when needed. this cookie is isolated
// and cannot be acessed by javascript

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get('/api/users/refresh', {
            withCredentials: true
        });
        console.log("RES: ",response)
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.accessToken);
            const decoded = jwtDecode(response.data.accessToken)

            return {
                ...prev,
                decoded: decoded,
                userRoles: response.data.userRoles,
                accessToken: response.data.accessToken
            }
        });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;
