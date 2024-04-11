import { useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import GoogleOauth from '../components/GoogleOauth';
import useRefreshToken from '../hooks/useRefreshToken';
import { FcGoogle } from "react-icons/fc";

const Login = () => {
    const { persist, setPersist } = useAuth();

    const navigate = useNavigate();
    const refresh = useRefreshToken();

    const togglePersist = () => {
        setPersist(prev => !prev);
    }

    useEffect(() => {
        localStorage.setItem("persist", persist);
    }, [persist])

    const redirectToGoogleSSO = async () => {

        const googleLoginURL = GoogleOauth()

        const newWindow = window.open(
          googleLoginURL,
          "_blank",
          "width=500,height=600"
        );
    
        if (newWindow) {
          let timer = setInterval(() => {
            if (newWindow.closed) {
              console.log("Yay we're authenticated");
              refresh()
              navigate('/');
              if (timer) clearInterval(timer);
            }
          }, 500);
        }
      };

    return (
        <section className=" mt-[20vh] flex flex-col items-center justify-center">
            <img src='./asd-black.png' className="h-[20vh] " alt="ASD"></img>
            <h1 className='my-10'>Log In</h1>
            <button onClick={redirectToGoogleSSO} className='google-login-button'><FcGoogle className='w-10 h-10 mr-10 bg-white'/>Sign in with Google</button>
            <div className="persistCheck mt-4">
                <input type="checkbox" id="persist" onChange={togglePersist} checked={persist}/>
                <label htmlFor="persist">Trust This Device</label>
            </div>
      </section>

    )
}

export default Login
