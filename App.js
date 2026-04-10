import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { Animated, StyleSheet, Text, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme';
import { AppProvider } from './src/context/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [bannerState, setBannerState] = useState('online');
  const [bannerVisible, setBannerVisible] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const [bannerTranslate] = useState(() => new Animated.Value(-48));

  useEffect(() => {
    const showBanner = (state) => {
      setBannerState(state);
      setBannerVisible(true);
      Animated.spring(bannerTranslate, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      if (state === 'online') {
        setTimeout(() => {
          Animated.timing(bannerTranslate, {
            toValue: -48,
            duration: 220,
            useNativeDriver: true,
          }).start(() => setBannerVisible(false));
        }, 1800);
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;

      if (!hasCheckedConnection) {
        setHasCheckedConnection(true);
        if (!online) showBanner('offline');
        return;
      }

      showBanner(online ? 'online' : 'offline');
    });

    return () => unsubscribe();
  }, [bannerTranslate, hasCheckedConnection]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <AppNavigator />
        {bannerVisible ? (
          <Animated.View
            style={[
              styles.banner,
              bannerState === 'offline' ? styles.bannerOffline : styles.bannerOnline,
              { transform: [{ translateY: bannerTranslate }] },
            ]}
          >
            <Text style={styles.bannerText}>
              {bannerState === 'offline' ? 'App is offline' : 'Connected'}
            </Text>
          </Animated.View>
        ) : null}
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    zIndex: 50,
    minWidth: 120,
    alignItems: 'center',
  },
  bannerOffline: {
    backgroundColor: '#111827',
  },
  bannerOnline: {
    backgroundColor: '#10b981',
  },
  bannerText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
