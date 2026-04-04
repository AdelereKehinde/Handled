import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme';
import { authAPI } from '../services/api';

export default function MainScreen({ navigation }) {
  const handleLogout = async () => {
    await authAPI.logout();
    navigation.replace('AuthEntry');
  };

  return (
    <View style={styles.container}>
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <Text style={styles.welcome}>You're in! 🌸</Text>
      <Text style={styles.sub}>The main app loads here.</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(108,92,231,0.1)',
    top: -60,
    left: -80,
  },
  blob2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0,207,255,0.07)',
    bottom: 80,
    right: -60,
  },
  welcome: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  sub: {
    fontSize: 16,
    color: Colors.whiteAlpha60,
    marginBottom: 40,
    textAlign: 'center',
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});
