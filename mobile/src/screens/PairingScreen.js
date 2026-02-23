import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDevice } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { APP_NAME, PAIRING_CODE_LENGTH } from '../utils/constants';

export default function PairingScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { completePairing } = useDevice();
  const { colors, isDark } = useTheme();
  const inputRef = useRef(null);

  const handleCodeChange = (text) => {
    // Strip non-alphanumeric except hyphens, uppercase, limit to 9 chars
    let cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Auto-insert hyphen after 4th character (format: UX5H-2RTM)
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8);
    }
    setCode(cleaned.slice(0, PAIRING_CODE_LENGTH));
  };

  const handlePair = async () => {
    if (code.length !== PAIRING_CODE_LENGTH) {
      Alert.alert('Invalid Code', 'Please enter the full pairing code (e.g. UX5H-2RTM)');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const response = await apiService.pairDevice(code);
      
      if (response.success) {
        await completePairing(response.deviceId, response.deviceToken);
      } else {
        Alert.alert('Pairing Failed', response.message || 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pair device');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  const isCodeComplete = code.length === PAIRING_CODE_LENGTH;

  // Focus the hidden input when user taps on boxes
  const focusInput = () => {
    // Use setTimeout to ensure focus happens after touch event completes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          {/* Brand Header with Logo */}
          <View className="items-center mb-10">
            <Image 
              source={require('../../assets/icon.png')}
              className="w-24 h-24 mb-4"
              resizeMode="contain"
            />
            <Text style={{ color: colors.text }} className="text-3xl font-bold mb-2 tracking-wide">
              {APP_NAME}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-base text-center leading-6">
              Enter the pairing code from your dashboard
            </Text>
          </View>

          {/* Code Input Boxes */}
          <View className="mb-6">
            {/* Hidden TextInput that captures all input */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="default"
              autoCapitalize="characters"
              maxLength={PAIRING_CODE_LENGTH}
              caretHidden={true}
              style={{
                position: 'absolute',
                left: -1000,
                width: 1,
                height: 1,
              }}
            />
            
            {/* Visual boxes - tap anywhere to focus */}
            <View 
              className="flex-row justify-center px-2"
              onStartShouldSetResponder={() => true}
              onResponderRelease={focusInput}
            >
              {Array.from({ length: PAIRING_CODE_LENGTH }, (_, index) => {
                // Show a visual dash separator between position 4 and 5 (the hyphen at index 4)
                if (index === 4) {
                  return (
                    <Text key={index} style={{ color: colors.textMuted }} className="text-2xl font-bold self-center mx-0.5">-</Text>
                  );
                }
                return (
                  <View 
                    key={index}
                    className="flex-1 mx-1 justify-center items-center"
                    style={{ 
                      backgroundColor: code[index] ? colors.surface : 'transparent',
                      borderWidth: 2,
                      borderColor: code[index] ? colors.warning : (index === code.length ? colors.danger : colors.border),
                      borderRadius: 10,
                      height: 52,
                    }}
                  >
                    <Text 
                      style={{ color: colors.text }}
                      className="text-xl font-bold"
                    >
                      {code[index] || ''}
                    </Text>
                  </View>
                );
              })}
            </View>
            
            <Text style={{ color: colors.textMuted }} className="text-xs text-center mt-3">
              {code.length}/{PAIRING_CODE_LENGTH} characters
            </Text>
          </View>

          {/* Pair Button */}
          <TouchableOpacity
            className={`rounded-xl py-[18px] items-center mb-4 flex-row justify-center ${isLoading ? 'opacity-70' : 'opacity-100'}`}
            style={{ backgroundColor: isCodeComplete && !isLoading ? colors.danger : colors.textMuted }}
            onPress={handlePair}
            disabled={isLoading || !isCodeComplete}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="link" size={20} color="#ffffff" />
                <Text className="text-light text-lg font-bold ml-2">
                  Pair Device
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
            <Text style={{ color: colors.textMuted }} className="px-4">or</Text>
            <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
          </View>

          {/* QR Scan Button */}
          <TouchableOpacity
            className="border-2 rounded-xl py-[18px] items-center flex-row justify-center"
            style={{ borderColor: colors.warning }}
            onPress={handleScanQR}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code" size={22} color={colors.warning} />
            <Text style={{ color: colors.warning }} className="text-lg font-bold ml-2">
              Scan QR Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="p-6 items-center">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={16} color={colors.warning} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-2">
              Get the pairing code from your Sentinelr dashboard
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
