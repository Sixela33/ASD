import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"
import useAlert from '../hooks/useAlert';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import * as Yup from 'yup';
import FormItem from '../components/FormItem'

const LOGIN_URL = '/api/users/login';

const userLoginShema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[A-Z])/, 'Must contain at least one uppercase character')
    //.matches(/^(?=.*[0-9])/, 'Must contain at least one number'),
  })

const Login = () => {
    const { setAuth, persist, setPersist } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate()
    const from = location.state?.from?.pathname || "/";

    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState('')
    const {setMessage} = useAlert()


    const handleSubmit = async (e) => {
        e.preventDefault();
        let schemaErrors = null

        try {
            userLoginShema.validateSync({ email, password }, { abortEarly: false })
        } catch (err) {
            schemaErrors = {}
            console.log(err)
            err.inner.forEach(error => {
                schemaErrors[error.path] = error.message;
            });
        }

        if(schemaErrors) {
            setValidationErrors(schemaErrors)
            return
        }
        try {
            const response = await axiosPrivate.post(LOGIN_URL,
                JSON.stringify({ email, password }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            const accessToken = response?.data?.accessToken;
            const userRoles = response?.data?.userRoles
            
            if (accessToken) {
                const decoded = jwtDecode(accessToken)
                setAuth({decoded, accessToken, userRoles})
            }
            setEmail('');
            setPassword('');
            navigate(from, { replace: true });

        } catch (error) {
            
            setMessage(error.response?.data);
            if (!error.response) {
                setMessage(error?.message)
            }
            errRef.current.focus();
        }
    }

    const togglePersist = () => {
        setPersist(prev => !prev);
    }

    useEffect(() => {
        localStorage.setItem("persist", persist);
    }, [persist])

    return (

        <section className=" mt-[20vh] flex flex-col items-center justify-center">
            <h1 className='mb-8'>Log In</h1>

            <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="mb-4">
                <FormItem
                    labelName="Email:"
                    type="text"
                    inputName="email"
                    value={email}
                    handleChange={(e) => setEmail(e.target.value)}
                    error={validationErrors.email}
                />                
            </div>
            <div className="mb-4">
            <FormItem
                labelName="Password:"
                type="password"
                inputName="password"
                value={password}
                handleChange={(e) => setPassword(e.target.value)}
                error={validationErrors.password}
            />
            </div>
            <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-400 focus:outline-none focus:border-none" type="submit">Login</button>
            <div className="persistCheck mt-4">
                <input type="checkbox" id="persist" onChange={togglePersist} checked={persist}/>
                <label htmlFor="persist">Trust This Device</label>
            </div>
            </form>
            <Link to="/changePass" className='go-back-button mt-4' >Forgot your Password?</Link>
      </section>

    )
}

export default Login
