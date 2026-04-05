import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';
import { InputField, PrimaryButton } from '../components/UI';
import { bugReportsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';

export default function ReportBugScreen({ navigation }) {
  const { user } = useApp();
  const [name, setName] = useState(user?.username || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await bugReportsAPI.create({
        name,
        error_message: message,
        user_id: user?.id || null,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f7f3ff', '#eef2ff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Report a bug" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>Report a bug</Text>
        <InputField label="Name (optional)" value={name} onChangeText={setName} />
        <InputField
          label="What happened?"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <PrimaryButton title="Send report" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
});
