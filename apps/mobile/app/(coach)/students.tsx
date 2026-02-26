import { useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '../../hooks/useWorkouts';
import type { User } from '@dryfit/types';

import { StudentCard } from '../../components/StudentCard';
import { SearchBar } from '../../components/SearchBar';

export default function CoachStudents() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useStudents();
  const students: User[] = data?.data?.students ?? [];

  const filteredStudents = useMemo(() => {
    return students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [students, search]);

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="h-14" />
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-white tracking-tight">Alunos</Text>
        <View className="bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs font-bold">{filteredStudents.length} total</Text>
        </View>
      </View>

      <View className="px-5">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar aluno..."
        />
      </View>

      <FlatList
        data={filteredStudents}
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
        renderItem={({ item }) => (
          <View className="px-5">
            <StudentCard
              student={item}
              onPress={() => { }}
              showOnlyActiveStatus={true}
            />
          </View>
        )}
      />
    </View>
  );
}
