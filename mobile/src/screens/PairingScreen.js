import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useDevice } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { APP_NAME, PAIRING_CODE_LENGTH } from '../utils/constants';
import GlassCard from '../components/GlassCard';
import { typography } from '../utils/typography';

export default function PairingScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { completePairing } = useDevice();
  const { colors, isDark } = useTheme();

  const handleCodeChange = (text) => {
    // Strip separators, uppercase, and limit to the expected code length
    let cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Auto-insert hyphen after 4th character (format: UX5H-2RTM)
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8);
    }
    setCode(cleaned.slice(0, PAIRING_CODE_LENGTH));
  };

  const handlePasteCode = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();

      if (!clipboardText.trim()) {
        Alert.alert('Nothing to Paste', 'Copy a pairing code, then try again.');
        return;
      }

      handleCodeChange(clipboardText);
      Keyboard.dismiss();
    } catch {
      Alert.alert('Paste Failed', 'Unable to read the copied pairing code. Please try again.');
    }
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={pairStyles.content}>
            {/* Brand Header with Logo */}
            <View style={pairStyles.brandWrap}>
              <View
                style={[
                  pairStyles.logoWrap,
                  { backgroundColor: colors.neuInset, borderColor: colors.border },
                ]}
              >
                <Image
                  source={require('../../assets/icon.png')}
                  style={{ width: 72, height: 72 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={[pairStyles.brandTitle, { color: colors.text }]}>
                {APP_NAME}
              </Text>
              <Text style={[pairStyles.brandSub, { color: colors.textSecondary }]}>
                Enter the pairing code from your dashboard
              </Text>
            </View>

            {/* Code Input Boxes */}
            <GlassCard style={{ marginBottom: 24 }}>
              <View style={pairStyles.codeInputContainer}>
                {/* Visual boxes rendered underneath the real input */}
                <View style={pairStyles.boxRow} pointerEvents="none">
                  {Array.from({ length: PAIRING_CODE_LENGTH }, (_, index) => {
                    if (index === 4) {
                      return (
                        <Text
                          key={index}
                          style={[pairStyles.dash, { color: colors.textMuted }]}
                        >
                          -
                        </Text>
                      );
                    }
                    const filled = !!code[index];
                    const isCursor = index === code.length;
                    return (
                      <View
                        key={index}
                        style={[
                          pairStyles.codeBox,
                          {
                            backgroundColor: filled ? colors.neuInset : 'transparent',
                            borderColor: filled
                              ? colors.warning
                              : isCursor
                                ? colors.danger
                                : colors.border,
                          },
                        ]}
                      >
                        <Text style={[pairStyles.codeChar, { color: colors.text }]}>
                          {code[index] || ''}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <TextInput
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="default"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  caretHidden
                  contextMenuHidden={false}
                  style={pairStyles.codeInputOverlay}
                  accessibilityLabel="Pairing code"
                  accessibilityHint="Type a code or touch and hold to paste"
                />
              </View>
              <Text style={[pairStyles.charCount, { color: colors.textMuted }]}>
                {code.length}/{PAIRING_CODE_LENGTH} characters
              </Text>
              <TouchableOpacity
                style={pairStyles.pasteButton}
                onPress={handlePasteCode}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Paste pairing code"
              >
                <Ionicons name="clipboard-outline" size={17} color={colors.warning} />
                <Text style={[pairStyles.pasteButtonText, { color: colors.warning }]}>
                  Paste code
                </Text>
              </TouchableOpacity>
            </GlassCard>

            {/* Pair Button */}
            <TouchableOpacity
              style={[
                pairStyles.pairBtn,
                {
                  backgroundColor: isCodeComplete && !isLoading ? colors.danger : colors.textMuted,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handlePair}
              disabled={isLoading || !isCodeComplete}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="link" size={20} color="#ffffff" />
                  <Text style={pairStyles.pairBtnText}>Pair Device</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={pairStyles.dividerRow}>
              <View style={[pairStyles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[pairStyles.dividerOr, { color: colors.textMuted }]}>or</Text>
              <View style={[pairStyles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* QR Scan Button */}
            <TouchableOpacity
              style={[pairStyles.qrBtn, { borderColor: colors.warning }]}
              onPress={handleScanQR}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code" size={22} color={colors.warning} />
              <Text style={[pairStyles.qrBtnText, { color: colors.warning }]}>
                Scan QR Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={pairStyles.footer}>
            <Ionicons name="information-circle" size={16} color={colors.warning} />
            <Text style={[pairStyles.footerText, { color: colors.textMuted }]}>
              Get the pairing code from your Sentinelr dashboard
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const pairStyles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    ...typography.headingBlack,
    fontSize: 30,
    marginBottom: 8,
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeInputContainer: {
    position: 'relative',
  },
  codeInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    color: 'transparent',
    backgroundColor: 'transparent',
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dash: {
    ...typography.bodyBold,
    fontSize: 22,
    alignSelf: 'center',
    marginHorizontal: 2,
  },
  codeBox: {
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    height: 52,
  },
  codeChar: {
    ...typography.bodyBold,
    fontSize: 20,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  pasteButton: {
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteButtonText: {
    ...typography.bodyBold,
    fontSize: 14,
    marginLeft: 6,
  },
  pairBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pairBtnText: {
    ...typography.bodyBold,
    color: '#fff',
    fontSize: 17,
    marginLeft: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerOr: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  qrBtn: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  qrBtnText: {
    ...typography.bodyBold,
    fontSize: 17,
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    marginLeft: 8,
  },
});
