import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '../theme';
import DecisionCard from '../components/DecisionCard';
import { GhostButton, PrimaryButton } from '../components/UI';
import { decisionsAPI } from '../services/api';
import LogoWatermark from '../components/LogoWatermark';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';

export default function DecisionOutputScreen({ navigation, route }) {
  const { decisionId, response, original, error } = route.params || {};
  const [deleting, setDeleting] = useState(false);
  const { themeMode, strings } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  const handleDelete = async () => {
    if (!decisionId) return;
    setDeleting(true);
    try {
      await decisionsAPI.remove(decisionId);
      navigation.navigate('DecisionHistory');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <LogoWatermark />
      <View style={styles.content}>
        <TopBar title="Decision result" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>{error ? 'We hit a snag' : 'Your decision'}</Text>
        <DecisionCard text={response || 'No response'} />

        <View style={styles.btnRow}>
          <PrimaryButton title="Saved" disabled />
          <PrimaryButton
            title="Continue decision"
            onPress={() =>
              navigation.navigate('DecisionInput', {
                preset: original,
              })
            }
          />
          <GhostButton title="Delete" onPress={handleDelete} style={styles.deleteBtn} />
          <GhostButton title="Back to history" onPress={() => navigation.navigate('DecisionHistory')} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 32, gap: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark },
  btnRow: { gap: 12 },
  deleteBtn: { borderColor: Colors.danger },
});
