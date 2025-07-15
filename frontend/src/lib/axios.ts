import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
});

// Function to set up axios interceptor with token
export const setupAxiosAuth = (getToken: () => Promise<string | null>) => {
	// Clear any existing interceptors
	axiosInstance.interceptors.request.clear();
	axiosInstance.interceptors.response.clear();

	// Add request interceptor to include auth token
	axiosInstance.interceptors.request.use(
		async (config) => {
			try {
				const token = await getToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
			} catch (error) {
				console.error("Error getting auth token:", error);
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Add response interceptor to handle auth errors
	axiosInstance.interceptors.response.use(
		(response) => response,
		async (error) => {
			if (error.response?.status === 401) {
				console.error("Unauthorized access - token may be invalid");
				// You might want to redirect to login or show an error message
			}
			return Promise.reject(error);
		}
	);
};