import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useStudents, useStudentsByDate, toLocalDateString } from '../../hooks/useWorkouts';
import { TabTransition } from '../../components/TabTransition';

export default function CoachDashboard() {
  const { user } = useAuthStore();

  const todayDate = toLocalDateString(new Date());

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents();
  const { data: todayWorkoutsData, isLoading: isLoadingWorkouts } = useStudentsByDate(todayDate);

  const totalStudents = studentsData?.data?.students?.length ?? 0;

  const todayStudents = todayWorkoutsData?.data?.students ?? [];
  const completedToday = todayStudents.filter((s) => s.workoutStatus === 'COMPLETED').length;
  const pendingToday = todayStudents.filter((s) => s.workoutStatus === 'PENDING').length;

  return (
    <TabTransition index={0} className="flex-1 bg-[#0a0a0a]">
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

        {/* Resumo de Hoje */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">Resumo de Hoje</Text>
          <View className="bg-zinc-900/80 border border-zinc-800/50 rounded-3xl p-6 shadow-lg shadow-black/20">
            {isLoadingWorkouts ? (
              <ActivityIndicator color="#b30f15" className="py-8" />
            ) : (
              <View>
                <View className="flex-row justify-between mb-6">
                  <View className="items-center flex-1">
                    <Text className="text-3xl font-black text-white">{completedToday}</Text>
                    <Text className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">Concluídos</Text>
                  </View>
                  <View className="w-px bg-zinc-800/50 h-full mx-2" />
                  <View className="items-center flex-1">
                    <Text className="text-3xl font-black text-white">{pendingToday}</Text>
                    <Text className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">Pendentes</Text>
                  </View>
                </View>

                {/* Visual Progress Bar */}
                <View className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex-row">
                  {completedToday + pendingToday > 0 ? (
                    <>
                      <View
                        className="bg-primary h-full rounded-full border-r border-zinc-900"
                        style={{ width: `${(completedToday / (completedToday + pendingToday)) * 100}%` }}
                      />
                      <View
                        className="bg-zinc-600 h-full rounded-r-full"
                        style={{ width: `${(pendingToday / (completedToday + pendingToday)) * 100}%` }}
                      />
                    </>
                  ) : (
                    <View className="bg-zinc-800/50 h-full w-full" />
                  )}
                </View>
                {completedToday + pendingToday === 0 && (
                  <Text className="text-zinc-500 text-xs text-center mt-4 tracking-tight">Nenhum treino programado para hoje</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Total de Alunos */}
        <View className="mb-6 mt-4">
          <View className="bg-zinc-900/80 border border-zinc-800/50 rounded-3xl p-6 shadow-lg shadow-black/20 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4 border border-primary/20">
                <Ionicons name="people" size={24} color="#b30f15" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Total de Alunos</Text>
                <Text className="text-zinc-400 text-xs mt-0.5">Sob sua tutoria</Text>
              </View>
            </View>
            {isLoadingStudents ? (
              <ActivityIndicator color="#b30f15" />
            ) : (
              <Text className="text-3xl font-black text-white">{totalStudents}</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </TabTransition>
  );
}
