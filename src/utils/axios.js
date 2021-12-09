import axios from "axios"


const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
})

// Add a request interceptor
axiosInstance.interceptors.request.use((config) => {
    // Do something before request is sent
    const user = (typeof window !== 'undefined') && JSON.parse(window.localStorage.getItem('AUTH_USER'));
    if (user) {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    // Do something with request error
    return Promise.reject(error);
});

export default axiosInstance