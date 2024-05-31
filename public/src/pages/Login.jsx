import { useEffect } from 'react';
import GoogleOauth from '../utls/GoogleIntegration/GoogleOauth';
import { FcGoogle } from "react-icons/fc";

const Login = () => {

    useEffect(() => {
        localStorage.setItem("persist", true);
    }, [])

    const redirectToGoogleSSO = async () => {
      const googleLoginURL = GoogleOauth()
      window.location.href = googleLoginURL
    };

    return (
        <section className="page items-center my-[20vh] ">
            <img src='./asd-black.png' className="h-[20vh] " alt="ASD"></img>
            <button onClick={redirectToGoogleSSO} className='google-login-button mt-10'><FcGoogle className='w-10 h-10 mr-10 bg-white'/>Continue with Google</button>
        </section>

    )
}

export default Login
