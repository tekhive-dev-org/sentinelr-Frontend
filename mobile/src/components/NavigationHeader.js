import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

/**
 * Professional Navigation Header Component with Theme Support
 */
export default function NavigationHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  navigation,
  showMenu = false,
  menuItems = [],
  currentScreen,
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-MENU_WIDTH))[0];
  const overlayAnim = useState(new Animated.Value(0))[0];
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -MENU_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuVisible(false));
  };

  const handleMenuItemPress = (item) => {
    closeMenu();
    if (item.onPress) {
      setTimeout(() => item.onPress(), 300);
    } else if (item.screen && navigation) {
      setTimeout(() => navigation.navigate(item.screen), 300);
    }
  };

  const defaultMenuItems = [
    { id: 'tracking', label: 'Tracking', icon: 'location', screen: 'Tracking' },
    { id: 'permissions', label: 'Permissions', icon: 'shield-checkmark', screen: 'Permissions' },
    { id: 'settings', label: 'Settings', icon: 'settings', screen: 'Settings' },
  ];

  const finalMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <>
      <View
        style={[
          navStyles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: colors.background,
            shadowColor: colors.neuDark,
            ...(Platform.OS === 'ios'
              ? { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 }
              : { elevation: 4 }),
          },
        ]}
      >
        {/* Left Section - Back or Menu */}
        <View style={navStyles.side}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={navStyles.backBtn}
              activeOpacity={0.7}
            >
              <View
                style={[
                  navStyles.backCircle,
                  { backgroundColor: colors.neuInset },
                ]}
              >
                <Ionicons name="chevron-back" size={18} color={colors.warning} />
              </View>
              <Text style={[navStyles.backLabel, { color: colors.warning }]}>
                {backLabel}
              </Text>
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity onPress={openMenu} style={{ padding: 8 }} activeOpacity={0.7}>
              <Ionicons name="menu" size={26} color={colors.warning} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Center Section - Title */}
        <View style={navStyles.center}>
          <Text style={[navStyles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[navStyles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section - Logo */}
        <View style={[navStyles.side, { alignItems: 'flex-end' }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={navStyles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Slide-out Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Overlay */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: '#000',
                opacity: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
              },
            ]}
          >
            <Pressable style={{ flex: 1 }} onPress={closeMenu} />
          </Animated.View>

          {/* Sliding Menu Panel */}
          <Animated.View
            style={[
              navStyles.menuPanel,
              {
                width: MENU_WIDTH,
                paddingTop: insets.top + 20,
                backgroundColor: colors.background,
                borderRightColor: colors.border,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Menu Header */}
            <View style={navStyles.menuHeader}>
              <View
                style={[
                  navStyles.menuLogoWrap,
                  { backgroundColor: colors.neuInset, borderColor: colors.border },
                ]}
              >
                <Image
                  source={require('../../assets/icon.png')}
                  style={{ width: 48, height: 48 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={[navStyles.menuTitle, { color: colors.text }]}>
                {APP_NAME}
              </Text>
              <Text style={[navStyles.menuSubtitle, { color: colors.textSecondary }]}>
                Security Companion
              </Text>
            </View>

            {/* Divider */}
            <View style={[navStyles.divider, { backgroundColor: colors.border }]} />

            {/* Menu Items */}
            <View style={navStyles.menuItems}>
              {finalMenuItems.map((item) => {
                const isActive = currentScreen === item.screen;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      navStyles.menuItem,
                      isActive && { backgroundColor: colors.neuInset },
                    ]}
                    onPress={() => handleMenuItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isActive ? colors.warning : colors.textSecondary}
                    />
                    <Text
                      style={[
                        navStyles.menuItemLabel,
                        { color: isActive ? colors.warning : colors.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isActive && (
                      <View style={[navStyles.activeDot, { backgroundColor: colors.danger }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Menu Footer */}
            <View style={navStyles.menuFooter}>
              <View style={[navStyles.divider, { backgroundColor: colors.border }]} />
              <Text style={[navStyles.versionText, { color: colors.textMuted }]}>
                Version 1.0.0
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const navStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  side: {
    width: 80,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logo: {
    width: 36,
    height: 36,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
  },
  backCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
  },
  menuHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  menuLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 16,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});
