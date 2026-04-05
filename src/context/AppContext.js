import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken, getToken } from '../services/api';
import { usersAPI } from '../services/api';

const AppContext = createContext(null);

const DAILY_QUOTA = 10;
const THEME_KEY = 'app_theme_mode';
const LANG_KEY = 'app_language';

const STRINGS = {
  en: {
    home: 'Home',
    calm: 'Calm Space',
    decisions: 'Decisions',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    newDecision: 'New decision',
    decisionHistory: 'Decision history',
    connectionCheck: 'Connection check',
    enterCalm: 'Enter Calm Space',
    quickSuggestions: 'Quick suggestions',
    recentDecisions: 'Recent decisions',
    viewAll: 'View all',
    submitDecision: 'Submit decision',
    refresh: 'Refresh',
    deleteAll: 'Delete all',
    searchDecisions: 'Search decisions',
  },
  yo: {
    home: 'Ile',
    calm: 'Ibi Ibalẹ',
    decisions: 'Ipinnu',
    notifications: 'Iwifunni',
    profile: 'Profaili',
    settings: 'Eto',
    newDecision: 'Ipinnu titun',
    decisionHistory: 'Itan ipinnu',
    connectionCheck: 'Ṣayẹwo asopọ',
    enterCalm: 'Wọ Ibi Ibalẹ',
    quickSuggestions: 'Awọn imọran yarayara',
    recentDecisions: 'Awọn ipinnu to ṣẹṣẹ',
    viewAll: 'Wo gbogbo',
    submitDecision: 'Firanṣẹ ipinnu',
    refresh: 'Tunṣe',
    deleteAll: 'Pa gbogbo rẹ',
    searchDecisions: 'Wa awọn ipinnu',
  },
};

const getTodayKey = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getQuotaKey = (userId) => `decision_quota_${userId}_${getTodayKey()}`;

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [decisionsUsed, setDecisionsUsed] = useState(0);
  const [themeMode, setThemeMode] = useState('light');
  const [language, setLanguage] = useState('en');

  const loadUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const token = await getToken();
      const decoded = decodeToken(token);
      const userId = decoded?.user_id || decoded?.sub || decoded?.id;
      if (!userId) {
        setUser(null);
        return;
      }
      const profile = await usersAPI.userById(userId);
      setUser(profile);

      const quotaKey = getQuotaKey(userId);
      const usedRaw = await AsyncStorage.getItem(quotaKey);
      setDecisionsUsed(usedRaw ? Number(usedRaw) : 0);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const incrementDecisionUsage = useCallback(async () => {
    if (!user?.id) return;
    const quotaKey = getQuotaKey(user.id);
    const next = decisionsUsed + 1;
    setDecisionsUsed(next);
    await AsyncStorage.setItem(quotaKey, String(next));
  }, [decisionsUsed, user?.id]);

  const resetQuotaIfNeeded = useCallback(async () => {
    if (!user?.id) return;
    const quotaKey = getQuotaKey(user.id);
    const existing = await AsyncStorage.getItem(quotaKey);
    if (existing === null) {
      setDecisionsUsed(0);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    resetQuotaIfNeeded();
  }, [resetQuotaIfNeeded]);

  useEffect(() => {
    const loadPrefs = async () => {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      const lang = await AsyncStorage.getItem(LANG_KEY);
      if (theme) setThemeMode(theme);
      if (lang) setLanguage(lang);
    };
    loadPrefs();
  }, []);

  const updateTheme = useCallback(async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const updateLanguage = useCallback(async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  const plan = user?.plan || (user?.is_premium ? 'premium' : 'free');
  const isFree = !user?.is_premium && (!user?.plan || user?.plan === 'free');
  const remaining = isFree ? Math.max(DAILY_QUOTA - decisionsUsed, 0) : Infinity;

  const value = useMemo(
    () => ({
      user,
      setUser,
      loadingUser,
      reloadUser: loadUser,
      plan,
      isFree,
      decisionsUsed,
      remainingDecisions: remaining,
      incrementDecisionUsage,
      themeMode,
      setThemeMode: updateTheme,
      language,
      setLanguage: updateLanguage,
      strings: STRINGS[language] || STRINGS.en,
    }),
    [
      user,
      loadingUser,
      loadUser,
      plan,
      isFree,
      decisionsUsed,
      remaining,
      incrementDecisionUsage,
      themeMode,
      updateTheme,
      language,
      updateLanguage,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};
