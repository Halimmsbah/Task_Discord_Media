import axios from 'axios';
import { API_BASE_URL, DEV_PHONE, ENDPOINTS } from '../config/apiConfig';

let cachedAuthToken = null;
let authTokenPromise = null;

const extractToken = (responseData) =>
  responseData?.token ||
  responseData?.accessToken ||
  responseData?.data?.token ||
  responseData?.data?.accessToken ||
  responseData?.result?.token ||
  responseData?.result?.accessToken ||
  (typeof responseData === 'string' ? responseData : null) ||
  null;

const loadAuthToken = async () => {
  if (cachedAuthToken) {
    return cachedAuthToken;
  }

  if (!authTokenPromise) {
    authTokenPromise = axios
      .get(`${API_BASE_URL}${ENDPOINTS.testToken(DEV_PHONE)}`)
      .then((response) => {
        const token = extractToken(response.data);

        if (!token) {
          throw new Error('Token not found in test-token response.');
        }

        cachedAuthToken = token;

        return token;
      })
      .finally(() => {
        authTokenPromise = null;
      });
  }

  return authTokenPromise;
};

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

API.interceptors.request.use(async (config) => {
  const token = await loadAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
