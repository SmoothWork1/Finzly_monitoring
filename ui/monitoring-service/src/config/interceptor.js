import axios from 'axios';
import { getToken } from './storage';


var axiosInstance = axios.create();
axiosInstance.defaults.timeout = 30000;

axiosInstance.interceptors.request.use(function (config) {
	const token = getToken();

	if(token) {
		config.headers['Authorization'] = token;
	}
	return config;
});

export default axiosInstance;
