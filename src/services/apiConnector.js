import axios from "axios";

export const axiosInstance = axios.create({
    withCredentials: true, // Important for CORS with credentials
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to handle CORS
axiosInstance.interceptors.request.use(
    (config) => {
        // Add any auth tokens if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle CORS errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('CORS')) {
            console.error('CORS Error:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method: method,
        url: url,
        data: bodyData?bodyData:null,
        headers: headers?headers:null,
        params: params?params:null
    })
};