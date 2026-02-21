import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScanScreen() {
  return (
    <View className="flex-1 bg-[#0f1115] items-center justify-center">
      <Ionicons name="qr-code-outline" size={48} color="#3f3f46" />
      <Text className="text-zinc-500 mt-3 font-medium">Scanner em breve</Text>
    </View>
  );
}
