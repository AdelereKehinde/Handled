import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://handled-app.onrender.com/';

const parseJsonSafe = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

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

  const text = await response.text();
  const data = parseJsonSafe(text);

  if (!response.ok) {
    throw new Error(
      (data && (data.detail || data.message)) || text || 'Something went wrong'
    );
  }

  return data ?? text;
};

export const authAPI = {
  signup: async (formData) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      body: formData, // multipart/form-data
    });
    const text = await response.text();
    const data = parseJsonSafe(text);
    if (!response.ok) {
      throw new Error((data && (data.detail || data.message)) || text || 'Signup failed');
    }
    return data ?? text;
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
