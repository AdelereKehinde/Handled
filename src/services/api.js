import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://andled-app-adelerekehinde8808-kdgkcaw5.leapcell.dev';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const buildUrl = (endpoint) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  if (!endpoint.startsWith('/')) {
    return `${BASE_URL}/${endpoint}`;
  }

  return `${BASE_URL}${endpoint}`;
};

const extractPayload = (payload) => payload?.data ?? payload;

const extractAccessToken = (payload) => {
  const data = extractPayload(payload);
  return (
    data?.access_token ||
    data?.token ||
    data?.accessToken ||
    data?.data?.access_token ||
    data?.data?.token ||
    null
  );
};

const extractRefreshToken = (payload) => {
  const data = extractPayload(payload);
  return data?.refresh_token || data?.data?.refresh_token || null;
};

const normalizeEmail = (email) => email?.trim().toLowerCase();

const getToken = async () => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

const setToken = async (token) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const setRefreshToken = async (token) => {
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const setAuthTokens = async ({ accessToken, refreshToken }) => {
  const tasks = [];

  if (accessToken) {
    tasks.push(AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken));
  }

  if (refreshToken) {
    tasks.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken));
  }

  await Promise.all(tasks);
};

const removeToken = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

const isNetworkError = (error) => {
  if (!error) return false;

  return (
    !error.response &&
    (error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      /network|timeout|internet|connection/i.test(error.message || ''))
  );
};

const decodeToken = (token) => {
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 <= Date.now();
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  const storedRefreshToken = await getRefreshToken();

  if (!storedRefreshToken) {
    await removeToken();
    throw new Error('Session expired. Please log in again.');
  }

  const response = await axios.post(buildUrl('/auth/refresh'), {
    refresh_token: storedRefreshToken,
  });

  const data = extractPayload(response.data);
  const accessToken = extractAccessToken(data);
  const refreshToken = extractRefreshToken(data);

  if (!accessToken) {
    await removeToken();
    throw new Error('Session expired. Please log in again.');
  }

  await setAuthTokens({
    accessToken,
    refreshToken: refreshToken || storedRefreshToken,
  });

  return accessToken;
};

api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};

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
  async (error) => {
    if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')) {
      return Promise.reject(
        new Error('We are taking longer than expected. Please check your connection and try again.')
      );
    }

    const originalRequest = error?.config;
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    const message =
      detail ||
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong';

    const shouldRefresh =
      status === 401 &&
      !originalRequest?._retry &&
      (detail === 'Token expired' || message === 'Token expired');

    if (shouldRefresh) {
      try {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api.request(originalRequest);
      } catch {
        await removeToken();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

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
    const data = extractPayload(
      await request('/auth/signup', {
        method: 'POST',
        data: {
          ...payload,
          email: normalizeEmail(payload.email),
        },
      })
    );

    await setAuthTokens({
      accessToken: extractAccessToken(data),
      refreshToken: extractRefreshToken(data),
    });

    return data;
  },

  login: async ({ email, password }) => {
    const data = extractPayload(
      await request('/auth/login', {
        method: 'POST',
        data: { email: normalizeEmail(email), password },
      })
    );

    await setAuthTokens({
      accessToken: extractAccessToken(data),
      refreshToken: extractRefreshToken(data),
    });

    return data;
  },

  verifyEmail: async ({ email, otp }) => {
    return await request('/auth/verify-email', {
      method: 'POST',
      data: { email: normalizeEmail(email), otp_code: otp },
    });
  },

  resendVerifyEmail: async ({ email }) => {
    return await request('/auth/verify-email/send', {
      method: 'POST',
      data: { email: normalizeEmail(email) },
    });
  },

  forgotPassword: async ({ email }) => {
    return await request('/auth/forgot-password', {
      method: 'POST',
      data: { email: normalizeEmail(email) },
    });
  },

  resetPassword: async ({ email, otp, new_password, confirm_password }) => {
    return await request('/auth/reset-password', {
      method: 'POST',
      data: {
        email: normalizeEmail(email),
        otp_code: otp,
        new_password,
        confirm_password: confirm_password || new_password,
      },
    });
  },

  refreshSession: async () => {
    await refreshAccessToken();
    return true;
  },

  logout: async () => {
    await removeToken();
  },

  isAuthenticated: async () => {
    const token = await getToken();
    if (!token) return false;

    if (!isTokenExpired(token)) {
      return true;
    }

    try {
      await refreshAccessToken();
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        return true;
      }

      await removeToken();
      return false;
    }
  },
};

export const decisionsAPI = {
  make: async ({ user_input, user_id, tokens_used = 0 }) => {
    return extractPayload(
      await request('/decisions/make', {
        method: 'POST',
        data: { user_input, user_id, tokens_used },
      })
    );
  },

  history: async (user_id) => {
    return extractPayload(await request(`/decisions/history/${user_id}`, { method: 'GET' }));
  },

  remove: async (decision_id) => {
    return extractPayload(await request(`/decisions/${decision_id}`, { method: 'DELETE' }));
  },

  removeAll: async (user_id) => {
    return extractPayload(await request(`/decisions/user/${user_id}`, { method: 'DELETE' }));
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
    return extractPayload(await request(`/users/${user_id}`, { method: 'GET' }));
  },
};

export const notificationsAPI = {
  list: async () => {
    return extractPayload(await request('/notifications/me', { method: 'GET' }));
  },

  markRead: async (id) => {
    return extractPayload(await request(`/notifications/me/${id}/read`, { method: 'POST' }));
  },
};

export const bugReportsAPI = {
  create: async (payload) => {
    return await request('/bug-reports/', { method: 'POST', data: payload });
  },
};

export const paymentsAPI = {
  createCheckout: async (payload) => {
    return extractPayload(
      await request('/payments/create-checkout', { method: 'POST', data: payload })
    );
  },
};

export {
  buildUrl,
  decodeToken,
  getRefreshToken,
  getToken,
  isNetworkError,
  removeToken, setAuthTokens, setRefreshToken,
  setToken
};

