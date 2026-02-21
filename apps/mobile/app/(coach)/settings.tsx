import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useInviteCode } from '../../hooks/useWorkouts';

export default function CoachSettings() {
  const { user, logout } = useAuthStore();
  const { data: inviteRes } = useInviteCode();
  const inviteCode = inviteRes?.data?.inviteCode ?? '------';

  const copyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copiado!', 'Código de convite copiado. Envie para seus alunos!');
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="h-14" />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-2xl font-extrabold text-white mb-8 tracking-tight">Configurações</Text>

        {/* Profile Card */}
        <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5 flex-row items-center gap-4">
          <View
            className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 items-center justify-center"
            style={{ shadowColor: '#b30f15', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
          >
            <Ionicons name="person" size={32} color="#b30f15" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{user?.name}</Text>
            <Text className="text-zinc-400 text-sm">{user?.email}</Text>
            <View className="mt-1.5 bg-primary px-2 py-0.5 rounded self-start">
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Coach</Text>
            </View>
          </View>
        </View>

        {/* Invite Code Card */}
        <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-5">
          <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">Código de Convite</Text>
          <Text className="text-zinc-400 text-sm mb-4">
            Compartilhe este código para que alunos possam entrar na sua equipe.
          </Text>
          <View className="bg-[#0a0a0a] border border-zinc-700 rounded-2xl px-6 py-4 items-center mb-4">
            <Text
              className="text-white font-black tracking-[8px] text-2xl"
            >
              {inviteCode}
            </Text>
          </View>
          <TouchableOpacity
            onPress={copyCode}
            className="flex-row items-center justify-center gap-2 bg-primary py-4 rounded-2xl"
            style={{ shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 }}
            activeOpacity={0.9}
          >
            <Ionicons name="copy-outline" size={18} color="white" />
            <Text className="text-white font-bold">Copiar código</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Sair', 'Deseja sair da sua conta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: logout },
            ])
          }
          className="flex-row items-center justify-center gap-2 bg-zinc-900 border border-red-900/50 py-4 rounded-2xl"
        >
          <Ionicons name="log-out-outline" size={20} color="#b30f15" />
          <Text className="text-primary font-bold">Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
