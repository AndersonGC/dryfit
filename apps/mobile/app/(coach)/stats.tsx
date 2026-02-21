import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  return (
    <View className="flex-1 bg-[#0a0a0a] items-center justify-center">
      <Ionicons name="bar-chart-outline" size={48} color="#3f3f46" />
      <Text className="text-zinc-500 mt-3 font-medium">Estatísticas em breve</Text>
    </View>
  );
}
