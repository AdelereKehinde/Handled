import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import TopBar from '../components/TopBar';
import { InputField, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { usersAPI } from '../services/api';
import { Colors } from '../theme';

export default function EditProfileScreen({ navigation }) {
  const { user, reloadUser, themeMode } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [description, setDescription] = useState(user?.description || '');
  const [allergic, setAllergic] = useState(user?.allergic || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersAPI.updateMe({ username, email, description, allergic });
      await reloadUser();
      Alert.alert('Success', 'Your profile has been updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Edit profile" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>Edit profile</Text>
        <InputField label="Username" value={username} onChangeText={setUsername} />
        <InputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField label="About you" value={description} onChangeText={setDescription} multiline />
        <InputField label="Allergies" value={allergic} onChangeText={setAllergic} />
        <PrimaryButton title="Save changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
});
