import axios from 'axios';
import { API_BASE_URL, DEV_PHONE, ENDPOINTS } from '../config/apiConfig';

let cachedAuthToken: string | null = null;
let authTokenPromise: Promise<string> | null = null;

type TokenPayload = {
  token?: string;
  accessToken?: string;
  data?: { token?: string; accessToken?: string };
  result?: { token?: string; accessToken?: string };
};

const extractToken = (responseData: unknown): string | null => {
  if (typeof responseData === 'string') {
    return responseData || null;
  }

  if (responseData && typeof responseData === 'object') {
    const payload = responseData as TokenPayload;
    return (
      payload.token ||
      payload.accessToken ||
      payload.data?.token ||
      payload.data?.accessToken ||
      payload.result?.token ||
      payload.result?.accessToken ||
      null
    );
  }

  return null;
};

const loadAuthToken = async (): Promise<string> => {
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
