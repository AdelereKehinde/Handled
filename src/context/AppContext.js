import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { decodeToken, getToken, isNetworkError, usersAPI } from '../services/api';

const AppContext = createContext(null);

const DAILY_QUOTA = 10;
const THEME_KEY = 'app_theme_mode';
const LANG_KEY = 'app_language';
const HAPTICS_KEY = 'haptics_enabled';
const REMINDER_ENABLED_KEY = 'daily_reminder_enabled';
const REMINDER_TIME_KEY = 'daily_reminder_time';
const USER_CACHE_PREFIX = 'cached_user_profile';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'ko', label: '한국어' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ur', label: 'اردو' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'vi', label: 'Tiếng Việt' },
];

const STRINGS = {
  en: {
    home: 'Home',
    calm: 'Calm Space',
    decisions: 'Decisions',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    faq: 'FAQs',
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
    result: 'Decision result',
    yourDecision: 'Your decision',
    hitSnag: 'We hit a snag',
    deletDecision: 'Delete decision',
    next: 'Next decision',
    back: 'Back',
    guidance: 'Daily Guidance',
    focus: 'Focus Mode',
    mood: 'Mood',
    dailyGuidance: 'Daily Guidance',
    focusMode: 'Focus Mode',
    moodDashboard: 'Mood Dashboard',
    microTasks: 'Task Breakdown',
  },
  es: {
    home: 'Inicio',
    calm: 'Espacio tranquilo',
    decisions: 'Decisiones',
    notifications: 'Notificaciones',
    profile: 'Perfil',
    settings: 'Ajustes',
    newDecision: 'Nueva decisión',
    decisionHistory: 'Historial de decisiones',
    connectionCheck: 'Verificar conexión',
    enterCalm: 'Entrar al espacio tranquilo',
    quickSuggestions: 'Sugerencias rápidas',
    recentDecisions: 'Decisiones recientes',
    viewAll: 'Ver todo',
    submitDecision: 'Enviar decisión',
    refresh: 'Actualizar',
    deleteAll: 'Eliminar todo',
    searchDecisions: 'Buscar decisiones',
  },
  fr: {
    home: 'Accueil',
    calm: 'Espace calme',
    decisions: 'Décisions',
    notifications: 'Notifications',
    profile: 'Profil',
    settings: 'Paramètres',
    newDecision: 'Nouvelle décision',
    decisionHistory: 'Historique des décisions',
    connectionCheck: 'Vérifier la connexion',
    enterCalm: 'Entrer dans l’espace calme',
    quickSuggestions: 'Suggestions rapides',
    recentDecisions: 'Décisions récentes',
    viewAll: 'Voir tout',
    submitDecision: 'Soumettre la décision',
    refresh: 'Actualiser',
    deleteAll: 'Tout supprimer',
    searchDecisions: 'Rechercher des décisions',
  },
  ar: {
    home: 'الرئيسية',
    calm: 'مساحة الهدوء',
    decisions: 'القرارات',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    newDecision: 'قرار جديد',
    decisionHistory: 'سجل القرارات',
    connectionCheck: 'التحقق من الاتصال',
    enterCalm: 'دخول مساحة الهدوء',
    quickSuggestions: 'اقتراحات سريعة',
    recentDecisions: 'القرارات الأخيرة',
    viewAll: 'عرض الكل',
    submitDecision: 'إرسال القرار',
    refresh: 'تحديث',
    deleteAll: 'حذف الكل',
    searchDecisions: 'البحث في القرارات',
  },
  zh: {
    home: '首页',
    calm: '平静空间',
    decisions: '决策',
    notifications: '通知',
    profile: '个人资料',
    settings: '设置',
    newDecision: '新决策',
    decisionHistory: '决策历史',
    connectionCheck: '连接检查',
    enterCalm: '进入平静空间',
    quickSuggestions: '快速建议',
    recentDecisions: '最近决策',
    viewAll: '查看全部',
    submitDecision: '提交决策',
    refresh: '刷新',
    deleteAll: '全部删除',
    searchDecisions: '搜索决策',
  },
  hi: {
    home: 'मुख्य पृष्ठ',
    calm: 'शांत स्थान',
    decisions: 'निर्णय',
    notifications: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    newDecision: 'नया निर्णय',
    decisionHistory: 'निर्णय इतिहास',
    connectionCheck: 'कनेक्शन जांच',
    enterCalm: 'शांत स्थान में जाएँ',
    quickSuggestions: 'त्वरित सुझाव',
    recentDecisions: 'हाल के निर्णय',
    viewAll: 'सभी देखें',
    submitDecision: 'निर्णय सबमिट करें',
    refresh: 'ताज़ा करें',
    deleteAll: 'सभी हटाएँ',
    searchDecisions: 'निर्णयों की खोज करें',
  },
  pt: {
    home: 'Início',
    calm: 'Espaço calmo',
    decisions: 'Decisões',
    notifications: 'Notificações',
    profile: 'Perfil',
    settings: 'Configurações',
    newDecision: 'Nova decisão',
    decisionHistory: 'Histórico de decisões',
    connectionCheck: 'Verificar conexão',
    enterCalm: 'Entrar no espaço calmo',
    quickSuggestions: 'Sugestões rápidas',
    recentDecisions: 'Decisões recentes',
    viewAll: 'Ver tudo',
    submitDecision: 'Enviar decisão',
    refresh: 'Atualizar',
    deleteAll: 'Excluir tudo',
    searchDecisions: 'Pesquisar decisões',
  },
  ru: {
    home: 'Главная',
    calm: 'Пространство спокойствия',
    decisions: 'Решения',
    notifications: 'Уведомления',
    profile: 'Профиль',
    settings: 'Настройки',
    newDecision: 'Новое решение',
    decisionHistory: 'История решений',
    connectionCheck: 'Проверка связи',
    enterCalm: 'Войти в пространство спокойствия',
    quickSuggestions: 'Быстрые советы',
    recentDecisions: 'Последние решения',
    viewAll: 'Показать все',
    submitDecision: 'Отправить решение',
    refresh: 'Обновить',
    deleteAll: 'Удалить все',
    searchDecisions: 'Поиск решений',
  },
  ja: {
    home: 'ホーム',
    calm: '落ち着きスペース',
    decisions: '決定',
    notifications: '通知',
    profile: 'プロフィール',
    settings: '設定',
    newDecision: '新しい決定',
    decisionHistory: '決定履歴',
    connectionCheck: '接続チェック',
    enterCalm: '落ち着きスペースに入る',
    quickSuggestions: 'クイック提案',
    recentDecisions: '最近の決定',
    viewAll: 'すべて表示',
    submitDecision: '決定を送信',
    refresh: '更新',
    deleteAll: 'すべて削除',
    searchDecisions: '決定を検索',
  },
  de: {
    home: 'Start',
    calm: 'Ruhiger Raum',
    decisions: 'Entscheidungen',
    notifications: 'Benachrichtigungen',
    profile: 'Profil',
    settings: 'Einstellungen',
    newDecision: 'Neue Entscheidung',
    decisionHistory: 'Entscheidungsverlauf',
    connectionCheck: 'Verbindung prüfen',
    enterCalm: 'Ruhigen Raum betreten',
    quickSuggestions: 'Schnelle Vorschläge',
    recentDecisions: 'Letzte Entscheidungen',
    viewAll: 'Alle ansehen',
    submitDecision: 'Entscheidung senden',
    refresh: 'Aktualisieren',
    deleteAll: 'Alles löschen',
    searchDecisions: 'Entscheidungen suchen',
  },
  it: {
    home: 'Home',
    calm: 'Spazio calmo',
    decisions: 'Decisioni',
    notifications: 'Notifiche',
    profile: 'Profilo',
    settings: 'Impostazioni',
    newDecision: 'Nuova decisione',
    decisionHistory: 'Cronologia decisioni',
    connectionCheck: 'Verifica connessione',
    enterCalm: 'Entra nello spazio calmo',
    quickSuggestions: 'Suggerimenti rapidi',
    recentDecisions: 'Decisioni recenti',
    viewAll: 'Vedi tutto',
    submitDecision: 'Invia decisione',
    refresh: 'Aggiorna',
    deleteAll: 'Elimina tutto',
    searchDecisions: 'Cerca decisioni',
  },
  ko: {
    home: '홈',
    calm: '차분한 공간',
    decisions: '결정',
    notifications: '알림',
    profile: '프로필',
    settings: '설정',
    newDecision: '새 결정',
    decisionHistory: '결정 내역',
    connectionCheck: '연결 확인',
    enterCalm: '차분한 공간으로 들어가기',
    quickSuggestions: '빠른 제안',
    recentDecisions: '최근 결정',
    viewAll: '모두 보기',
    submitDecision: '결정 제출',
    refresh: '새로 고침',
    deleteAll: '모두 삭제',
    searchDecisions: '결정 검색',
  },
  tr: {
    home: 'Ana Sayfa',
    calm: 'Sakin Alan',
    decisions: 'Kararlar',
    notifications: 'Bildirimler',
    profile: 'Profil',
    settings: 'Ayarlar',
    newDecision: 'Yeni karar',
    decisionHistory: 'Karar geçmişi',
    connectionCheck: 'Bağlantı kontrolü',
    enterCalm: 'Sakin alana gir',
    quickSuggestions: 'Hızlı öneriler',
    recentDecisions: 'Son kararlar',
    viewAll: 'Tümünü gör',
    submitDecision: 'Kararı gönder',
    refresh: 'Yenile',
    deleteAll: 'Hepsini sil',
    searchDecisions: 'Karar ara',
  },
  id: {
    home: 'Beranda',
    calm: 'Ruang Tenang',
    decisions: 'Keputusan',
    notifications: 'Notifikasi',
    profile: 'Profil',
    settings: 'Pengaturan',
    newDecision: 'Keputusan baru',
    decisionHistory: 'Riwayat keputusan',
    connectionCheck: 'Periksa koneksi',
    enterCalm: 'Masuk ke ruang tenang',
    quickSuggestions: 'Saran cepat',
    recentDecisions: 'Keputusan terbaru',
    viewAll: 'Lihat semua',
    submitDecision: 'Kirim keputusan',
    refresh: 'Segarkan',
    deleteAll: 'Hapus semua',
    searchDecisions: 'Cari keputusan',
  },
  nl: {
    home: 'Home',
    calm: 'Kalmte ruimte',
    decisions: 'Beslissingen',
    notifications: 'Meldingen',
    profile: 'Profiel',
    settings: 'Instellingen',
    newDecision: 'Nieuwe beslissing',
    decisionHistory: 'Beslissingengeschiedenis',
    connectionCheck: 'Verbinding controleren',
    enterCalm: 'Ga naar kalmte ruimte',
    quickSuggestions: 'Snel suggesties',
    recentDecisions: 'Recente beslissingen',
    viewAll: 'Alles bekijken',
    submitDecision: 'Beslissing indienen',
    refresh: 'Vernieuwen',
    deleteAll: 'Alles verwijderen',
    searchDecisions: 'Zoek beslissingen',
  },
  pl: {
    home: 'Strona główna',
    calm: 'Przestrzeń spokoju',
    decisions: 'Decyzje',
    notifications: 'Powiadomienia',
    profile: 'Profil',
    settings: 'Ustawienia',
    newDecision: 'Nowa decyzja',
    decisionHistory: 'Historia decyzji',
    connectionCheck: 'Sprawdź połączenie',
    enterCalm: 'Wejdź do przestrzeni spokoju',
    quickSuggestions: 'Szybkie sugestie',
    recentDecisions: 'Ostatnie decyzje',
    viewAll: 'Zobacz wszystkie',
    submitDecision: 'Wyślij decyzję',
    refresh: 'Odśwież',
    deleteAll: 'Usuń wszystko',
    searchDecisions: 'Szukaj decyzji',
  },
  sw: {
    home: 'Nyumbani',
    calm: 'Eneo la utulivu',
    decisions: 'Maamuzi',
    notifications: 'Arifa',
    profile: 'Wasifu',
    settings: 'Mipangilio',
    newDecision: 'Uamuzi mpya',
    decisionHistory: 'Historia ya maamuzi',
    connectionCheck: 'Kagua muunganisho',
    enterCalm: 'Ingiza eneo la utulivu',
    quickSuggestions: 'Mapendekezo ya haraka',
    recentDecisions: 'Maamuzi ya hivi karibuni',
    viewAll: 'Tazama yote',
    submitDecision: 'Tuma uamuzi',
    refresh: 'Sasisha',
    deleteAll: 'Futa yote',
    searchDecisions: 'Tafuta maamuzi',
  },
  ur: {
    home: 'ہوم',
    calm: 'پرسکون جگہ',
    decisions: 'فیصلے',
    notifications: 'اطلاعات',
    profile: 'پروفائل',
    settings: 'سیٹنگز',
    newDecision: 'نیا فیصلہ',
    decisionHistory: 'فیصلوں کی تاریخ',
    connectionCheck: 'کنکشن چیک کریں',
    enterCalm: 'پرسکون جگہ میں داخل ہوں',
    quickSuggestions: 'فوری تجاویز',
    recentDecisions: 'حالیہ فیصلے',
    viewAll: 'سب دیکھیں',
    submitDecision: 'فیصلہ جمع کروائیں',
    refresh: 'تازہ کریں',
    deleteAll: 'سب حذف کریں',
    searchDecisions: 'فیصلوں کی تلاش',
  },
  bn: {
    home: 'হোম',
    calm: 'শান্ত স্থান',
    decisions: 'নির্ণয়',
    notifications: 'নোটিফিকেশন',
    profile: 'প্রোফাইল',
    settings: 'সেটিংস',
    newDecision: 'নতুন সিদ্ধান্ত',
    decisionHistory: 'সিদ্ধান্ত ইতিহাস',
    connectionCheck: 'সংযোগ পরীক্ষা',
    enterCalm: 'শান্ত স্থানে প্রবেশ করুন',
    quickSuggestions: 'দ্রুত পরামর্শ',
    recentDecisions: 'সাম্প্রতিক সিদ্ধান্ত',
    viewAll: 'সব দেখুন',
    submitDecision: 'সিদ্ধান্ত জমা দিন',
    refresh: 'রিফ্রেশ',
    deleteAll: 'সব মুছুন',
    searchDecisions: 'সিদ্ধান্ত খুঁজুন',
  },
  vi: {
    home: 'Trang chủ',
    calm: 'Không gian bình yên',
    decisions: 'Quyết định',
    notifications: 'Thông báo',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
    newDecision: 'Quyết định mới',
    decisionHistory: 'Lịch sử quyết định',
    connectionCheck: 'Kiểm tra kết nối',
    enterCalm: 'Vào không gian bình yên',
    quickSuggestions: 'Gợi ý nhanh',
    recentDecisions: 'Quyết định gần đây',
    viewAll: 'Xem tất cả',
    submitDecision: 'Gửi quyết định',
    refresh: 'Làm mới',
    deleteAll: 'Xóa tất cả',
    searchDecisions: 'Tìm kiếm quyết định',
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
const getUserCacheKey = (userId) => `${USER_CACHE_PREFIX}_${userId}`;

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [decisionsUsed, setDecisionsUsed] = useState(0);
  const [themeMode, setThemeMode] = useState('light');
  const [language, setLanguage] = useState('en');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState('20:00');

  const loadUser = useCallback(async () => {
    setLoadingUser(true);

    try {
      const token = await getToken();
      const decoded = decodeToken(token);
      const userId = decoded?.user_id || decoded?.sub || decoded?.id;

      if (!userId) {
        setUser(null);
        setDecisionsUsed(0);
        return;
      }

      const profile = await usersAPI.userById(userId);
      setUser(profile);
      await AsyncStorage.setItem(getUserCacheKey(userId), JSON.stringify(profile));

      const quotaKey = getQuotaKey(userId);
      const usedRaw = await AsyncStorage.getItem(quotaKey);
      setDecisionsUsed(usedRaw ? Number(usedRaw) : 0);
    } catch (error) {
      const token = await getToken();
      const decoded = decodeToken(token);
      const userId = decoded?.user_id || decoded?.sub || decoded?.id;

      if (userId && isNetworkError(error)) {
        const cachedProfile = await AsyncStorage.getItem(getUserCacheKey(userId));
        if (cachedProfile) {
          setUser(JSON.parse(cachedProfile));

          const quotaKey = getQuotaKey(userId);
          const usedRaw = await AsyncStorage.getItem(quotaKey);
          setDecisionsUsed(usedRaw ? Number(usedRaw) : 0);
          return;
        }
      }

      setUser(null);
      setDecisionsUsed(0);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const incrementDecisionUsage = useCallback(async () => {
    if (!user?.id) return;

    const quotaKey = getQuotaKey(user.id);
    const stored = await AsyncStorage.getItem(quotaKey);
    const current = stored ? Number(stored) : decisionsUsed;
    const next = current + 1;

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
      const haptics = await AsyncStorage.getItem(HAPTICS_KEY);
      const reminderEnabled = await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
      const reminderTime = await AsyncStorage.getItem(REMINDER_TIME_KEY);

      if (theme) setThemeMode(theme);
      if (lang) setLanguage(lang);
      if (haptics !== null) setHapticsEnabled(haptics === 'true');
      if (reminderEnabled !== null) setDailyReminderEnabled(reminderEnabled === 'true');
      if (reminderTime) setDailyReminderTime(reminderTime);
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

  const updateHapticsEnabled = useCallback(async (enabled) => {
    setHapticsEnabled(enabled);
    await AsyncStorage.setItem(HAPTICS_KEY, String(enabled));
  }, []);

  const updateDailyReminderEnabled = useCallback(async (enabled) => {
    setDailyReminderEnabled(enabled);
    await AsyncStorage.setItem(REMINDER_ENABLED_KEY, String(enabled));
  }, []);

  const updateDailyReminderTime = useCallback(async (time) => {
    setDailyReminderTime(time);
    await AsyncStorage.setItem(REMINDER_TIME_KEY, time);
  }, []);

  const scheduleDailyReminder = useCallback(async (enabled, time) => {
    if (!enabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    const [hour, minute] = time.split(':').map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily calm reminder',
        body: 'Take a moment to breathe and stay grounded today.',
        sound: 'default',
      },
      trigger: { hour, minute, repeats: true },
    });
  }, []);

  useEffect(() => {
    scheduleDailyReminder(dailyReminderEnabled, dailyReminderTime);
  }, [dailyReminderEnabled, dailyReminderTime, scheduleDailyReminder]);

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
      hapticsEnabled,
      setHapticsEnabled: updateHapticsEnabled,
      dailyReminderEnabled,
      setDailyReminderEnabled: updateDailyReminderEnabled,
      dailyReminderTime,
      setDailyReminderTime: updateDailyReminderTime,
      availableLanguages: LANGUAGE_OPTIONS,
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
