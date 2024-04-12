import axios from 'axios';
export const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VITE_BASE_PATH : 'http://localhost:8080';
console.log('process.env.NODE_ENV', process.env.NODE_ENV)
console.log('process.env.VITE_BASE_PATH', process.env.VITE_BASE_PATH)
export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

export const axiosPrivateImage = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
});