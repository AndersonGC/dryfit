import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';

const getAvatarKey = (userId?: string) => `student_avatar_uri_${userId}`;

export default function StudentProfile() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Load persisted avatar on mount
  useEffect(() => {
    if (!user?.id) return;
    SecureStore.getItemAsync(getAvatarKey(user.id)).then((uri) => {
      if (uri) setAvatarUri(uri);
    });
  }, [user?.id]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria para alterar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      if (user?.id) {
        await SecureStore.setItemAsync(getAvatarKey(user.id), uri);
      }
    }
  };

  return (
    <View className="flex-1 bg-[#FAF8F5] dark:bg-[#0f1115]">
      <View className="h-14" />
      <View className="px-5">
        {/* Header */}
        <Text className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-8 tracking-tight">Perfil</Text>

        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="relative">
            <View
              className="w-24 h-24 rounded-full bg-white dark:bg-zinc-800 border-2 border-primary items-center justify-center mb-4 overflow-hidden"
              style={{ shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={44} color="#b30f15" />
              )}
            </View>
            {/* Edit button */}
            <TouchableOpacity
              onPress={handlePickImage}
              className="absolute bottom-3 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-[#FAF8F5] dark:border-[#0f1115]"
              style={{ elevation: 4 }}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-zinc-900 dark:text-white">{user?.name}</Text>
          <Text className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{user?.email}</Text>
          <View className="mt-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-bold">Aluno</Text>
          </View>
        </View>

        {/* Info card */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-6">
          <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Informações</Text>
          <View className="flex-row items-center gap-3 mb-3">
            <Ionicons name="person-outline" size={18} color="#a1a1aa" className="dark:text-[#71717a]" />
            <Text className="text-zinc-900 dark:text-white text-sm">{user?.name}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="at-outline" size={18} color="#a1a1aa" className="dark:text-[#71717a]" />
            <Text className="text-zinc-900 dark:text-white text-sm">{user?.email}</Text>
          </View>
        </View>

        {/* Theme Settings Card */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-6 flex-row items-center justify-between">
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
      </View>
    </View>
  );
}
