import { axiosPrivateImage } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivateImage = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {

        const requestIntercept = axiosPrivateImage.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `${auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivateImage.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `${newAccessToken}`;
                    return axiosPrivateImage(prevRequest);
                }
                return Promise.reject(error);
            }
        )

        return () => {
            axiosPrivateImage.interceptors.request.eject(requestIntercept);
            axiosPrivateImage.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh])

    return axiosPrivateImage;
}

export default useAxiosPrivateImage;