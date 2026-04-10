import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import TopBar from '../components/TopBar';
import { InputField, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { usersAPI } from '../services/api';
import { Colors } from '../theme';

export default function ChangePasswordScreen({ navigation }) {
  const { themeMode } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePasswords = (currentNewPassword = newPassword, currentConfirmPassword = confirmPassword) => {
    const newErrors = {};

    if (oldPassword && currentNewPassword && oldPassword === currentNewPassword) {
      newErrors.newPassword = 'New password must be different from old password';
    }

    if (currentNewPassword && currentConfirmPassword && currentNewPassword !== currentConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    // Clear error when user starts typing
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: undefined }));
    }
    // Validate immediately if old password is set
    if (oldPassword) {
      validatePasswords(text, confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    // Clear error when user starts typing
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    // Validate immediately
    validatePasswords(newPassword, text);
  };

  const handleSave = async () => {
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    try {
      await usersAPI.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      Alert.alert('Success', 'Your password has been changed successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Change password" onBack={() => navigation.goBack()} icon="key" />
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
          onChangeText={handleNewPasswordChange}
          secureTextEntry
          error={errors.newPassword}
        />
        <InputField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry
          error={errors.confirmPassword}
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
