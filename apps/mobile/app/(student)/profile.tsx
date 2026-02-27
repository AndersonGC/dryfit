import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useAlert } from '../../hooks/useCustomAlert';
import { TabTransition } from '../../components/TabTransition';

export default function StudentProfile() {
  const { user, logout, updateProfile } = useAuthStore();
  const { showAlert } = useAlert();
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permissão negada', 'Precisamos de acesso à sua galeria para alterar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setIsUpdating(true);
      try {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateProfile({ avatarUrl: base64Uri });
      } catch (error) {
        showAlert('Erro', 'Não foi possível atualizar a foto.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <TabTransition index={4} className="flex-1 bg-[#0f1115]">
      <View className="h-14" />
      <View className="px-5">
        {/* Header */}
        <Text className="text-2xl font-extrabold text-white mb-8 tracking-tight">Perfil</Text>

        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="relative">
            <View
              className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-primary items-center justify-center mb-4 overflow-hidden"
              style={{ shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={{ width: 96, height: 96 }} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={44} color="#b30f15" />
              )}
              {isUpdating && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </View>
            {/* Edit button */}
            <TouchableOpacity
              onPress={handlePickImage}
              className="absolute bottom-3 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-[#0f1115]"
              style={{ elevation: 4 }}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-white">{user?.name}</Text>
          <Text className="text-zinc-400 text-sm mt-1">{user?.email}</Text>
          <View className="mt-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-bold">Aluno</Text>
          </View>
        </View>

        {/* Info card */}
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Informações</Text>
          <View className="flex-row items-center gap-3 mb-3">
            <Ionicons name="person-outline" size={18} color="#71717a" />
            <Text className="text-white text-sm">{user?.name}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="at-outline" size={18} color="#71717a" />
            <Text className="text-white text-sm">{user?.email}</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={() =>
            showAlert('Sair', 'Deseja sair da sua conta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: logout },
            ])
          }
          className="flex-row items-center justify-center gap-2 bg-zinc-900 border border-red-900/50 py-4 rounded-2xl"
        >
          <Ionicons name="log-out-outline" size={20} color="#b30f15" />
          <Text className="text-primary font-bold">Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </TabTransition>
  );
}
