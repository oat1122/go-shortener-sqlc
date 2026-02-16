import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if not using cookies
    // const token = useAuthStore.getState().token;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token logic
      // window.location.href = '/login';
      // console.warn("Unauthorized access - 401");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
