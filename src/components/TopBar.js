import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadows } from '../theme';

export default function TopBar({ title, onBack, rightIcon, onRightPress, tintColor = Colors.textDark, navigation, showNotifications = false, onNotificationsPress, icon }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { name: 'Guidance', icon: 'bulb', screen: 'Guidance' },
    { name: 'Focus', icon: 'play-circle', screen: 'Focus' },
    { name: 'Mood', icon: 'happy', screen: 'Mood' },
    { name: 'Micro Tasks', icon: 'grid', screen: 'MicroTasks' },
  ];

  const handleMenuPress = (screen) => {
    setMenuVisible(false);
    const rootNavigation = navigation?.getParent?.()?.getParent?.();
    if (rootNavigation?.navigate) {
      rootNavigation.navigate(screen);
      return;
    }

    navigation?.navigate(screen);
  };

  return (
    <>
      <View style={styles.wrap}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={tintColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconSpacer} />
        )}
        <View style={styles.titleContainer}>
          {icon && (
            <Ionicons name={icon} size={20} color={tintColor} style={styles.titleIcon} />
          )}
          <Text style={[styles.title, { color: tintColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.rightIcons}>
          {showNotifications && (
            <TouchableOpacity onPress={onNotificationsPress} style={styles.iconBtnSmall} activeOpacity={0.8}>
              <Ionicons name="notifications" size={18} color={tintColor} />
            </TouchableOpacity>
          )}
          {navigation && (
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtnSmall} activeOpacity={0.8}>
              <Ionicons name="menu" size={18} color={tintColor} />
            </TouchableOpacity>
          )}
          {!navigation && rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.iconBtnSmall} activeOpacity={0.8}>
              <Ionicons name={rightIcon} size={18} color={tintColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, Shadows.card]}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                onPress={() => handleMenuPress(item.screen)}
                style={styles.menuItem}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={20} color={Colors.primary} />
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  iconBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(159,71,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  iconSpacer: {
    width: 36,
    height: 36,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: '700',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100, // Moved down as requested
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minWidth: 180,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
  },
  menuText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '500',
  },
});
