import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import { useInviteCode, useGenerateInviteCode } from '../../hooks/useWorkouts';

export default function CoachSettings() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { data: inviteRes } = useInviteCode();
  const generateMutate = useGenerateInviteCode();

  const inviteCode = inviteRes?.data?.inviteCode ?? '------';
  const isGenerating = generateMutate.isPending;

  const copyCode = async () => {
    if (inviteCode === '------') return;
    await Clipboard.setStringAsync(inviteCode);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copiado!', 'Código de convite copiado. Envie para seus alunos!');
  };

  const handleGenerateNewCode = () => {
    Alert.alert(
      'Gerar Novo Convite',
      'Isso criará um novo código e manterá o atual válido até ser usado. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Gerar',
          onPress: async () => {
            try {
              await generateMutate.mutateAsync();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              Alert.alert('Erro', 'Não foi possível gerar novo código.');
            }
          }
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FAF8F5] dark:bg-[#0a0a0a]">
      <View className="h-14" />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-8 tracking-tight">Configurações</Text>

        {/* Profile Card */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-5 flex-row items-center gap-4">
          <View
            className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 items-center justify-center"
            style={{ shadowColor: '#b30f15', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
          >
            <Ionicons name="person" size={32} color="#b30f15" />
          </View>
          <View className="flex-1">
            <Text className="text-zinc-900 dark:text-white font-bold text-lg">{user?.name}</Text>
            <Text className="text-zinc-500 dark:text-zinc-400 text-sm">{user?.email}</Text>
            <View className="mt-1.5 bg-primary px-2 py-0.5 rounded self-start">
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Coach</Text>
            </View>
          </View>
        </View>

        {/* Invite Code Card */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-5">
          <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-3">Código de Convite</Text>
          <Text className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
            Compartilhe este código para que alunos possam entrar na sua equipe.
          </Text>
          <View className="bg-[#FAF8F5] dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 items-center gap-2 mb-4">
            {isGenerating ? (
              <ActivityIndicator color="#b30f15" size="small" />
            ) : (
              <Text className="text-zinc-900 dark:text-white font-black tracking-[8px] text-2xl">
                {inviteCode}
              </Text>
            )}
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleGenerateNewCode}
              disabled={isGenerating}
              className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl border ${isGenerating ? 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900' : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                }`}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={18} color={isGenerating ? '#a1a1aa' : (theme === 'dark' ? 'white' : '#18181b')} />
              <Text className={`font-bold ${isGenerating ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                Gerar Novo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={copyCode}
              disabled={isGenerating}
              className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl ${isGenerating ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-primary'
                }`}
              style={!isGenerating ? { shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 } : undefined}
              activeOpacity={0.9}
            >
              <Ionicons name="copy-outline" size={18} color={isGenerating ? '#a1a1aa' : 'white'} />
              <Text className={`font-bold ${isGenerating ? 'text-zinc-400 dark:text-zinc-500' : 'text-white'}`}>Copiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Settings Card */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
              <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={20} color={theme === 'dark' ? '#fbbf24' : '#f59e0b'} />
            </View>
            <View>
              <Text className="text-zinc-900 dark:text-white font-bold text-base">Modo Escuro</Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-xs">Ajuste o tema do app</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            className={`w-14 h-8 rounded-full justify-center px-1 ${theme === 'dark' ? 'bg-primary' : 'bg-zinc-300'}`}
          >
            <View className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
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
          className="flex-row items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-red-500/20 dark:border-red-900/50 py-4 rounded-2xl"
        >
          <Ionicons name="log-out-outline" size={20} color="#b30f15" />
          <Text className="text-primary font-bold">Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
