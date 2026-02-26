import {
  View,
  Text,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';

export default function CoachDashboard() {
  const { user } = useAuthStore();

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Status bar spacer */}
      <View className="h-14 bg-[#0a0a0a]/80" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-sm text-zinc-400 font-medium">Welcome back,</Text>
            <Text className="text-2xl font-extrabold text-white tracking-tight">
              {user?.name?.split(' ')[0] ?? 'Trainer'}
            </Text>
          </View>
          <View className="relative">
            <View className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-primary items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={24} color="#b30f15" />
              )}
            </View>
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[#0a0a0a]" />
          </View>
        </View>

        {/* Dashboard Placeholder */}
        <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 items-center mt-12">
          <Ionicons name="stats-chart-outline" size={48} color="#3f3f46" />
          <Text className="text-white font-bold mt-4 text-lg">Resumo</Text>
          <Text className="text-zinc-500 text-sm mt-2 text-center">
            Seu painel de visão geral da conta de Coach aparecerá aqui. Use a aba de Builder para criar treinos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
