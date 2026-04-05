import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import AppNavigator from './src/navigation/AppNavigator';
import NoInternetScreen from './src/screens/NoInternetScreen';
import { Colors } from './src/theme';
import { AppProvider } from './src/context/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [checked, setChecked] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(online);
      setChecked(true);
      if (online) {
        setIsRetrying(false);
      }
    });

    NetInfo.fetch().then((state) => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(online);
      setChecked(true);
    });

    return () => unsub();
  }, []);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      const state = await NetInfo.fetch();
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(online);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <AppNavigator />
        {checked && !isOnline ? (
          <NoInternetScreen onRetry={handleRetry} isRetrying={isRetrying} overlay />
        ) : null}
      </AppProvider>
    </GestureHandlerRootView>
  );
}
