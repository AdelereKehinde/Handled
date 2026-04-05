import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://andled-app-adelerekehinde8808-kdgkcaw5.leapcell.dev';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

const buildUrl = (endpoint) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  if (!endpoint.startsWith('/')) {
    return `${BASE_URL}/${endpoint}`;
  }
  return `${BASE_URL}${endpoint}`;
};

const parseJsonSafe = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const TOKEN_KEY = 'auth_token';

const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')) {
      return Promise.reject(
        new Error('We’re taking longer than expected. Please check your connection and try again.')
      );
    }
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

const request = async (endpoint, options = {}) => {
  const { method = 'GET', data, params, headers } = options;
  const response = await api.request({
    url: buildUrl(endpoint),
    method,
    data,
    params,
    headers,
  });
  return response.data;
};

export const authAPI = {
  signup: async (payload) => {
    return await request('/auth/signup', {
      method: 'POST',
      data: payload,
    });
  },

  login: async ({ email, password }) => {
    const data = await request('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    if (data.token || data.access_token) {
      await setToken(data.token || data.access_token);
    }
    return data;
  },

  verifyEmail: async ({ email, otp }) => {
    return await request('/auth/verify-email', {
      method: 'POST',
      data: { email, otp },
    });
  },

  forgotPassword: async ({ email }) => {
    return await request('/auth/forgot-password', {
      method: 'POST',
      data: { email },
    });
  },

  resetPassword: async ({ email, otp, new_password }) => {
    return await request('/auth/reset-password', {
      method: 'POST',
      data: { email, otp, new_password },
    });
  },

  logout: async () => {
    await removeToken();
  },

  isAuthenticated: async () => {
    const token = await getToken();
    return !!token;
  },
};

export const decisionsAPI = {
  make: async ({ user_input, user_id, tokens_used = 0 }) => {
    return await request('/decisions/make', {
      method: 'POST',
      params: { user_input, user_id, tokens_used },
    });
  },
  history: async (user_id) => {
    return await request(`/decisions/history/${user_id}`, { method: 'GET' });
  },
  remove: async (decision_id) => {
    return await request(`/decisions/${decision_id}`, { method: 'DELETE' });
  },
};

export const usersAPI = {
  profile: async (user_id) => {
    return await request(`/users/profile/${user_id}`, { method: 'GET' });
  },
  updateMe: async (payload) => {
    return await request('/users/me', { method: 'PUT', data: payload });
  },
  changePassword: async (payload) => {
    return await request('/users/me/password', { method: 'PUT', data: payload });
  },
  deleteMe: async () => {
    return await request('/users/me', { method: 'DELETE' });
  },
  userById: async (user_id) => {
    return await request(`/users/${user_id}`, { method: 'GET' });
  },
};

export const notificationsAPI = {
  list: async () => {
    return await request('/notifications/me', { method: 'GET' });
  },
  markRead: async (id) => {
    return await request(`/notifications/me/${id}/read`, { method: 'POST' });
  },
};

export const bugReportsAPI = {
  create: async (payload) => {
    return await request('/bug-reports', { method: 'POST', data: payload });
  },
};

export const paymentsAPI = {
  createCheckout: async (payload) => {
    return await request('/payments/create-checkout', { method: 'POST', data: payload });
  },
};

export { setToken, getToken, removeToken, decodeToken, buildUrl };
