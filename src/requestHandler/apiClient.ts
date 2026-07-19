import axios from 'axios';
import {API_BASE_URL} from '@env';

// Backend is Rails session-cookie auth (see Sahulat Drive API.postman_collection.json):
// POST /session sets an HTTP-only _sahulat_drive_session cookie, no Bearer token
// is ever issued. withCredentials lets RN's native networking layer store and
// resend that cookie automatically on subsequent requests to the same host.
const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized — session missing or expired');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
