import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme';

export default function TopBar({ title, onBack, rightIcon, onRightPress, tintColor = Colors.textDark }) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={tintColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconSpacer} />
      )}
      <Text style={[styles.title, { color: tintColor }]} numberOfLines={1}>
        {title}
      </Text>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} activeOpacity={0.8}>
          <Ionicons name={rightIcon} size={20} color={tintColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(159,71,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: {
    width: 36,
    height: 36,
  },
  title: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: '700',
  },
});
