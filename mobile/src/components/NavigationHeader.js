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
        className="flex-row items-center px-4 pb-4 border-b"
        style={{ 
          paddingTop: insets.top + 12,
          backgroundColor: colors.background,
          borderColor: colors.borderLight
        }}
      >
        {/* Left Section - Back or Menu */}
        <View className="w-20 items-start">
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              className="flex-row items-center py-2 pr-3"
              activeOpacity={0.7}
            >
              <View 
                className="w-7 h-7 rounded-full justify-center items-center mr-1.5"
                style={{ backgroundColor: colors.primary }}
              >
                <Ionicons name="chevron-back" size={18} color={colors.warning} />
              </View>
              <Text style={{ color: colors.warning }} className="text-sm font-semibold">{backLabel}</Text>
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity
              onPress={openMenu}
              className="p-2"
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={26} color={colors.warning} />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>

        {/* Center Section - Title */}
        <View className="flex-1 items-center">
          <Text style={{ color: colors.text }} className="text-lg font-bold tracking-wide" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section - Logo */}
        <View className="w-20 items-end">
          <Image 
            source={require('../../assets/icon.png')}
            className="w-9 h-9"
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
        <View className="flex-1 flex-row">
          {/* Overlay */}
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{
              opacity: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
            }}
          >
            <Pressable className="flex-1" onPress={closeMenu} />
          </Animated.View>

          {/* Sliding Menu Panel */}
          <Animated.View
            className="absolute left-0 top-0 bottom-0 border-r"
            style={[
              { 
                width: MENU_WIDTH, 
                paddingTop: insets.top + 20,
                backgroundColor: colors.background,
                borderColor: colors.border
              },
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Menu Header */}
            <View className="items-center py-6 px-5">
              <Image 
                source={require('../../assets/icon.png')}
                className="w-16 h-16 mb-3"
                resizeMode="contain"
              />
              <Text style={{ color: colors.text }} className="text-[22px] font-extrabold tracking-wider">{APP_NAME}</Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs mt-1 tracking-wide">Security Companion</Text>
            </View>

            {/* Divider */}
            <View className="h-[1px] mx-5 mb-3" style={{ backgroundColor: colors.border }} />

            {/* Menu Items */}
            <View className="flex-1 px-3">
              {finalMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center py-4 px-4 my-1 rounded-xl"
                  style={{ backgroundColor: currentScreen === item.screen ? colors.primary : 'transparent' }}
                  onPress={() => handleMenuItemPress(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={22} 
                    color={currentScreen === item.screen ? colors.warning : colors.textSecondary} 
                  />
                  <Text
                    style={{ color: currentScreen === item.screen ? colors.warning : colors.textSecondary }}
                    className="text-base font-semibold flex-1 ml-4"
                  >
                    {item.label}
                  </Text>
                  {currentScreen === item.screen && (
                    <View 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.danger }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Menu Footer */}
            <View className="px-5 pb-6">
              <View className="h-[1px] mb-4" style={{ backgroundColor: colors.borderLight }} />
              <Text style={{ color: colors.textMuted }} className="text-[11px] text-center">Version 1.0.0</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
