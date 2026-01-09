import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <View className="items-center">
          <Text className="text-white text-6xl font-bold mb-2">Sentinelr</Text>
          <Text className="text-gray-400 text-2xl">Mobile Tracking Agent</Text>
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
