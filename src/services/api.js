import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://127.0.0.1:8000';

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

const setToken = async (token) => {
  await AsyncStorage.setItem('auth_token', token);
};

const removeToken = async () => {
  await AsyncStorage.removeItem('auth_token');
};

const request = async (endpoint, options = {}) => {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Something went wrong');
  }

  return data;
};

export const authAPI = {
  signup: async (formData) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      body: formData, // multipart/form-data
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.message || 'Signup failed');
    return data;
  },

  login: async ({ email, password }) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token || data.access_token) {
      await setToken(data.token || data.access_token);
    }
    return data;
  },

  verifyEmail: async ({ email, otp }) => {
    return await request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  forgotPassword: async ({ email }) => {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async ({ email, otp, new_password }) => {
    return await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password }),
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

export { setToken, getToken, removeToken };
