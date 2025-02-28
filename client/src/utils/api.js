import axios from "axios";
import Utils from "../shared/Utils";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create an axios instance with default settings
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor to **add token to every request**
apiClient.interceptors.request.use((config) => {
    const token = Utils.getItemFromLocalStorage("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default apiClient;
