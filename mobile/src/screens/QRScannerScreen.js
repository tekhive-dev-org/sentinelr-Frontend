import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useDevice } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { completePairing } = useDevice();
  const { colors } = useTheme();

  useEffect(() => {
    if (permission?.status === 'undetermined') {
      requestPermission();
    }
    setHasPermission(permission?.granted);
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);

    try {
      let code = data;
      
      try {
        const parsed = JSON.parse(data);
        code = parsed.code || parsed.pairing_code || data;
      } catch {
        // Not JSON, use raw data
      }

      if (!/^\d{6}$/.test(code)) {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid pairing code', [
          { text: 'Try Again', onPress: () => setScanned(false) }
        ]);
        setIsProcessing(false);
        return;
      }

      const response = await apiService.pairDevice(code);
      
      if (response.success) {
        await completePairing(response.device_id, response.upload_token);
      } else {
        Alert.alert('Pairing Failed', response.message || 'Please try again', [
          { text: 'Try Again', onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pair device', [
        { text: 'Try Again', onPress: () => setScanned(false) }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="justify-center items-center">
        <Ionicons name="camera" size={48} color={colors.warning} />
        <Text style={{ color: colors.text }} className="text-base text-center p-6">
          Requesting camera permission...
        </Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="justify-center items-center px-6">
        <Ionicons name="camera-outline" size={64} color={colors.danger} />
        <Text style={{ color: colors.text }} className="text-lg text-center mt-4 mb-2">
          Camera Access Required
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm text-center mb-6">
          Camera permission is required to scan QR codes
        </Text>
        <Text 
          style={{ color: colors.warning }}
          className="text-base font-semibold underline"
          onPress={requestPermission}
        >
          Tap to Grant Permission
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="p-6 items-center">
        <Ionicons name="qr-code" size={32} color={colors.warning} />
        <Text style={{ color: colors.text }} className="text-2xl font-bold mt-2 mb-2">Scan QR Code</Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm text-center">
          Point your camera at the QR code on your dashboard
        </Text>
      </View>

      {/* Camera Container */}
      <View className="flex-1 mx-6 mb-6 rounded-2xl overflow-hidden">
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        
        {/* Scan overlay - centered */}
        <View 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ width: 250, height: 250, position: 'relative' }}>
            {/* Top Left Corner */}
            <View style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: colors.warning }} />
            {/* Top Right Corner */}
            <View style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: colors.warning }} />
            {/* Bottom Left Corner */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: colors.warning }} />
            {/* Bottom Right Corner */}
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: colors.warning }} />
          </View>
        </View>
      </View>

      {/* Processing Overlay */}
      {isProcessing && (
        <View className="absolute inset-0 bg-black/70 justify-center items-center">
          <View 
            className="px-8 py-6 rounded-2xl border items-center"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <Ionicons name="sync" size={32} color={colors.warning} />
            <Text style={{ color: colors.text }} className="text-lg font-bold mt-3">Pairing device...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
