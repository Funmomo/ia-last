import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
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

// Add a response interceptor with HTTPS fallback and token handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token
    if (error.response?.status === 401 && error.response?.headers['token-expired']) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login?expired=true';
      return Promise.reject(error);
    }

    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Log the error for debugging
      console.error('401 Unauthorized:', error.response?.data);
      console.error('Request URL:', originalRequest.url);
      console.error('Request Headers:', originalRequest.headers);
      
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If SSL error, try HTTP fallback
    if ((error.code === 'ERR_SSL_PROTOCOL_ERROR' || error.code === 'EPROTO') && !originalRequest._httpFallback) {
      originalRequest._httpFallback = true;
      const httpUrl = originalRequest.url.replace('https://', 'http://').replace(':5001', ':5000');
      originalRequest.url = httpUrl;
      return axios(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('userRole', response.data.user.role);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Helper function to safely decode JWT tokens
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return {};
  }
};

export const login = async (credentials) => {
  try {
    console.log('=== Starting Login Request ===');
    const response = await api.post('/auth/login', credentials);
    console.log('Raw login response:', response.data);

    if (!response.data || !response.data.token) {
      throw new Error('Invalid response from server');
    }

    const token = response.data.token;
    const decodedToken = decodeJWT(token);
    console.log('Decoded JWT payload:', decodedToken);

    // Extract role from token claims
    let role = null;
    const roleClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    console.log('Role from JWT claims:', roleClaim);

    // Store token and authentication status
    localStorage.setItem('token', token);
    localStorage.setItem('isAuthenticated', 'true');

    // Store user info if available
    if (decodedToken.nameid || decodedToken.sub) {
      localStorage.setItem('userId', decodedToken.nameid || decodedToken.sub);
    }
    if (decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']) {
      localStorage.setItem('username', decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']);
    }
    if (decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']) {
      localStorage.setItem('userEmail', decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']);
    }

    // Return response with role from claims
    return {
      ...response.data,
      role: roleClaim // This will be "Admin", "Staff", or default to regular user
    };

  } catch (error) {
    console.error('Login Error:', error);
    throw error.response?.data || error.message;
  }
};

export default api; 