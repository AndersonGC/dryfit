import { View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useStudents } from '../../hooks/useWorkouts';
import type { User } from '@dryfit/types';

function StudentItem({ item }: { item: User }) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4 border-b border-zinc-800/60">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-2xl bg-zinc-800 items-center justify-center">
          <Ionicons name="person" size={22} color="#71717a" />
        </View>
        <View>
          <Text className="text-white font-bold">{item.name}</Text>
          <Text className="text-zinc-500 text-xs">{item.email}</Text>
        </View>
      </View>
      <View className="bg-zinc-800 px-3 py-1 rounded-full">
        <Text className="text-xs text-zinc-400 font-medium">Ativo</Text>
      </View>
    </View>
  );
}

export default function CoachStudents() {
  const { data, isLoading } = useStudents();
  const students: User[] = data?.data?.students ?? [];

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="h-14" />
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-white tracking-tight">Alunos</Text>
        <View className="bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs font-bold">{students.length} total</Text>
        </View>
      </View>
      <FlatList
        data={students}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-12"><ActivityIndicator color="#b30f15" /></View>
          ) : (
            <View className="items-center py-16">
              <Ionicons name="people-outline" size={48} color="#3f3f46" />
              <Text className="text-zinc-500 mt-3">Nenhum aluno cadastrado</Text>
              <Text className="text-zinc-600 text-sm mt-1 text-center px-8">
                Compartilhe seu código de convite para que alunos se cadastrem.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <StudentItem item={item} />}
      />
    </View>
  );
}
