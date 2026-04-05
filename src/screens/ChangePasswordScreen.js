import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';
import { InputField, PrimaryButton } from '../components/UI';
import { usersAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';

export default function ChangePasswordScreen({ navigation }) {
  const { themeMode } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersAPI.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Change password" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>Change password</Text>
        <InputField
          label="Old password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <InputField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <InputField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <PrimaryButton title="Update password" onPress={handleSave} loading={loading} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
});
