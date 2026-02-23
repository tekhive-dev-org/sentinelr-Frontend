import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useDevice } from "../context/DeviceContext";
import { useTheme } from "../context/ThemeContext";
import { apiService } from "../services/api";

const { width, height } = Dimensions.get("window");
const SCAN_SIZE = width * 0.7; // 70% of screen width
const SCAN_DURATION = 2000;

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { completePairing } = useDevice();
  const { colors } = useTheme();

  // Animation values
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission?.status === "undetermined") {
      requestPermission();
    }
    setHasPermission(permission?.granted);
  }, [permission]);

  useEffect(() => {
    startScanAnimation();
  }, []);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: SCAN_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: SCAN_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);

    try {
      let code = data;

      // Handle sentinelr:// deep link URL (from web dashboard QR)
      if (data.startsWith("sentinelr://")) {
        try {
          const url = new URL(data);
          code = url.searchParams.get("code") || data;
        } catch {
          // Fallback: extract code with regex
          const match = data.match(/[?&]code=([^&]+)/);
          code = match ? match[1] : data;
        }
      } else {
        // Try JSON format
        try {
          const parsed = JSON.parse(data);
          code =
            parsed.code || parsed.pairingCode || parsed.pairing_code || data;
        } catch {
          // Not JSON, use raw data
        }
      }

      if (
        !/^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/.test(code) &&
        !/^[A-Za-z0-9-]{4,12}$/.test(code)
      ) {
        Alert.alert(
          "Invalid QR Code",
          "This QR code is not a valid pairing code",
          [{ text: "Try Again", onPress: () => setScanned(false) }],
        );
        setIsProcessing(false);
        return;
      }

      const response = await apiService.pairDevice(code);

      if (response.success) {
        await completePairing(response.deviceId, response.deviceToken);
      } else {
        Alert.alert("Pairing Failed", response.message || "Please try again", [
          { text: "Try Again", onPress: () => setScanned(false) },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to pair device", [
        { text: "Try Again", onPress: () => setScanned(false) },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: "black" }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <Text style={styles.textWhite}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: "black" }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <Ionicons name="camera-off-outline" size={64} color="#ef4444" />
          <Text style={[styles.textWhite, styles.title]}>No Camera Access</Text>
          <Text style={[styles.textDim, styles.subtitle]}>
            We need camera permission to scan the pairing code.
          </Text>
          <Text
            onPress={requestPermission}
            style={[styles.textLink, { color: colors.warning }]}
          >
            Grant Permission
          </Text>
        </View>
      </View>
    );
  }

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_SIZE],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Dark Overlay Mask */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayCenterRow}>
          <View style={styles.overlaySide} />
          <View style={styles.scanWindow}>
            {/* Animated Scan Line */}
            {!scanned && !isProcessing && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY }],
                    backgroundColor: colors.warning,
                  },
                ]}
              />
            )}

            {/* Corner Markers */}
            <View
              style={[
                styles.corner,
                styles.topLeft,
                { borderColor: colors.warning },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.topRight,
                { borderColor: colors.warning },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomLeft,
                { borderColor: colors.warning },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomRight,
                { borderColor: colors.warning },
              ]}
            />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Floating Header */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="qr-code" size={24} color="white" />
          </View>
          <Text style={styles.headerTitle}>Scan Pairing Code</Text>
          <Text style={styles.headerSubtitle}>
            Align the QR code within the frame
          </Text>
        </View>
      </SafeAreaView>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View
            style={[styles.processingCard, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name="sync"
              size={32}
              color={colors.warning}
              style={styles.spinIcon}
            />
            <Text style={[styles.processingText, { color: 
              'white'
             }]}>
              Pairing Device...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  textWhite: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  textDim: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: 14,
  },
  textLink: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  // Overlay Mask Styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  overlayTop: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  overlayCenterRow: {
    flexDirection: "row",
    height: SCAN_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: "transparent",
    position: "relative",
    overflow: "hidden", // Clip the scan line
  },
  overlayBottom: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  // Scan UI
  scanLine: {
    width: "100%",
    height: 2,
    position: "absolute",
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 4,
    borderRadius: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  // Header
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: "center",
  },
  headerContent: {
    marginTop: 20,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 50,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Processing
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)", // Darker for focus
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  processingCard: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
});
