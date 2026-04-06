import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

const ICONS = {
  Home: 'home',
  Decisions: 'sparkles',
  Calm: 'moon',
  Profile: 'person',
};

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { themeMode } = useApp();
  const isDark = themeMode === 'dark';
  return (
    <View style={styles.wrap}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tab, isFocused && styles.tabActive]}
            activeOpacity={0.85}
          >
            <Ionicons
              name={`${ICONS[label] || 'ellipse'}${isFocused ? '' : '-outline'}`}
              size={22}
              color={isFocused ? Colors.primary : (isDark ? Colors.primary : Colors.textLight)}
            />
            <Text
              style={[
                styles.label,
                isFocused && styles.labelActive,
                !isFocused && isDark && { color: Colors.primary },
              ]}
            >
              {label}
            </Text>
            {isFocused && <View style={styles.glow} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  tabActive: {
    backgroundColor: 'rgba(159,71,241,0.08)',
    ...Shadows.glow,
  },
  label: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.primary,
  },
  glow: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 4,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
});
