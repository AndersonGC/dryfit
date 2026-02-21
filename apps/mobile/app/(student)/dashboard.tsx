import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/auth.store';
import { useActiveWorkout, useCompleteWorkout } from '../../hooks/useWorkouts';
import type { WorkoutType } from '@dryfit/types';

const WORKOUT_LABELS: Record<WorkoutType, string> = {
  STRENGTH: 'FOR TIME',
  WOD: 'WOD',
  HIIT: 'EMOM',
  CUSTOM: 'AMRAP',
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const TODAY = new Date();

function buildDays() {
  const currentDay = TODAY.getDay(); // 0 is Sunday
  // We want Monday (1) to be the first day of the week, so we calculate days from last Monday
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

  // Go back 4 weeks (28 days) exactly to a Monday
  const daysToSubtract = 28 + daysFromMonday;

  const days = [];
  // Generate 9 full weeks (63 days)
  for (let i = 0; i < 63; i++) {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() - daysToSubtract + i);
    days.push({
      date: new Date(d),
      day: DAY_LABELS[d.getDay()],
      num: d.getDate(),
      isToday: d.toDateString() === TODAY.toDateString(),
    });
  }
  return { days, todayIndex: daysToSubtract };
}

const { days: ALL_DAYS, todayIndex: TODAY_INDEX } = buildDays();

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { data: workoutRes, isLoading } = useActiveWorkout();
  const completeWorkout = useCompleteWorkout();
  const { width } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const calendarRef = useRef<FlatList>(null);

  // The calendar shows exactly 7 days without gap for the container calculation,
  // we handle the spacing using a wrapper.
  const dayItemWidth = (width - 40) / 7;

  // Scroll to the start of the current week when calendar mounts
  useEffect(() => {
    setTimeout(() => {
      const currentWeekIndex = Math.floor(TODAY_INDEX / 7) * 7;
      calendarRef.current?.scrollToIndex({ index: currentWeekIndex, animated: false, viewPosition: 0 });
    }, 100);
  }, []);

  const workout = workoutRes?.data?.workout;
  const monthName = selectedDate.toLocaleString('pt-BR', { month: 'long' });

  const handleComplete = useCallback(async () => {
    if (!workout) return;
    Alert.alert('Marcar como concluído?', 'Você quer finalizar o treino de hoje?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Concluir!',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          try {
            await completeWorkout.mutateAsync(workout.id);
          } catch {
            Alert.alert('Erro', 'Não foi possível marcar o treino como concluído.');
          }
        },
      },
    ]);
  }, [workout, completeWorkout]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Workout for the selected day (check by date if available, else use active workout for today)
  const showWorkout = workout && isSameDay(selectedDate, new Date());

  const openYouTube = useCallback(async (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o vídeo do YouTube.');
    }
  }, []);

  return (
    <View className="flex-1 bg-[#0f1115]">
      <View className="h-12" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center overflow-hidden">
              <Ionicons name="person" size={20} color="#71717a" />
            </View>
            <View>
              <Text className="text-xs text-zinc-400">{greeting()},</Text>
              <Text className="text-lg font-bold text-white">{user?.name?.split(' ')[0] ?? 'Atleta'} 👋</Text>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
            <Ionicons name="notifications-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Calendário — Semanal */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-bold text-lg text-white">Calendário</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="chevron-back" size={14} color="#71717a" />
              <Text className="text-zinc-300 text-sm font-medium capitalize">{monthName}</Text>
              <Ionicons name="chevron-forward" size={14} color="#71717a" />
            </View>
          </View>

          <FlatList
            ref={calendarRef}
            data={ALL_DAYS}
            keyExtractor={(item) => item.date.toDateString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 40}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 0 }}
            getItemLayout={(_, index) => ({
              length: dayItemWidth,
              offset: dayItemWidth * index,
              index,
            })}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(() => {
                calendarRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
              }, 200);
            }}
            renderItem={({ item }) => {
              const isSelected = isSameDay(item.date, selectedDate);
              const hasWorkout = item.isToday && !!workout;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedDate(item.date)}
                  activeOpacity={0.8}
                  style={{
                    width: dayItemWidth,
                    height: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 72,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                  >
                    {/* Fundo pílula absoluto sempre em tela, alterando apenas OPACIDADE para resolver bug de sombra no Android */}
                    <View
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: '#b30f15',
                        borderRadius: 22,
                        shadowColor: '#b30f15',
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 8,
                        opacity: isSelected ? 1 : 0,
                      }}
                    />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: isSelected ? 'rgba(255,255,255,0.9)' : '#71717a', marginBottom: 6, zIndex: 1 }}>
                      {item.day}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: isSelected ? '#fff' : '#e4e4e7', zIndex: 1 }}>
                      {item.num}
                    </Text>
                    {hasWorkout && !isSelected && (
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#b30f15', marginTop: 4, position: 'absolute', bottom: 6, zIndex: 1 }} />
                    )}
                    {hasWorkout && isSelected && (
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginTop: 4, position: 'absolute', bottom: 6, zIndex: 1 }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Treino do Dia */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-bold text-xl text-white">Treino do Dia</Text>
            {showWorkout && (
              <Text className="text-sm text-zinc-400">45 min</Text>
            )}
          </View>

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#b30f15" size="large" />
            </View>
          ) : !showWorkout ? (
            <View className="bg-[#1c1f26] border border-zinc-800 rounded-3xl p-8 items-center">
              <Ionicons name="barbell-outline" size={48} color="#3f3f46" />
              <Text className="text-white font-bold mt-4 text-lg">Sem treino hoje</Text>
              <Text className="text-zinc-500 text-sm mt-2 text-center">
                Seu coach ainda não enviou treino para hoje. Descanse bem!
              </Text>
            </View>
          ) : (
            <>
              {/* WOD Hero */}
              <View className="w-full h-44 rounded-3xl overflow-hidden mb-6 bg-zinc-900">
                <View className="absolute inset-0 bg-[#0a0a0a]/60 z-10" />
                <View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                <View className="absolute bottom-5 left-5 z-20">
                  <View className="bg-primary px-2 py-1 rounded mb-2 self-start">
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {WORKOUT_LABELS[workout.type] || workout.type}
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold text-white">{workout.title}</Text>
                  <Text className="text-zinc-300 text-sm mt-1">Enviado pelo seu Coach</Text>
                </View>
                <View className="absolute top-4 right-4 z-20 bg-white/10 rounded-full px-3 py-1 flex-row items-center gap-1">
                  <Ionicons name="flame" size={14} color="white" />
                  <Text className="text-white text-xs font-medium">480 kcal</Text>
                </View>
                <View className="flex-1 bg-zinc-900 items-center justify-center">
                  <Ionicons name="barbell" size={80} color="#1c1f26" />
                </View>
              </View>

              {/* Exercícios */}
              {workout.status === 'COMPLETED' && (
                <View className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3 mb-4 flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text className="text-green-400 font-bold">Treino concluído hoje! 🎉</Text>
                </View>
              )}

              {/* Informações Extras do Treino (Descrição e YouTube) */}
              {(workout.description || workout.youtubeVideoId) && (
                <View className="bg-[#1c1f26] border border-zinc-800 rounded-2xl p-4 mb-6">
                  {workout.description && (
                    <Text className="text-zinc-300 text-sm leading-relaxed">
                      {workout.description}
                    </Text>
                  )}
                  {workout.youtubeVideoId && (
                    <TouchableOpacity
                      onPress={() => openYouTube(workout.youtubeVideoId as string)}
                      className={`flex-row items-center justify-center gap-2 bg-[#ff0000]/10 border border-[#ff0000]/30 py-3 rounded-xl ${workout.description ? 'mt-4' : ''}`}
                    >
                      <Ionicons name="logo-youtube" size={18} color="#ff0000" />
                      <Text className="text-[#ff0000] font-bold text-sm">Assistir Vídeo do Treino</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <Text className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                Exercícios ({((workout as any).exercises as any[])?.length ?? 0})
              </Text>

              <View className="gap-3">
                {((workout as any).exercises || []).map((ex: any, i: number) => (
                  <View
                    key={ex.id || i}
                    className="flex-row items-center p-3 bg-[#1c1f26] rounded-2xl border border-zinc-800"
                    style={{ shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}
                  >
                    <View className="w-16 h-16 rounded-xl bg-zinc-800 items-center justify-center flex-shrink-0">
                      <Ionicons name="barbell-outline" size={26} color="#3f3f46" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="font-bold text-white text-sm">{ex.name}</Text>
                      <View className="flex-row gap-4 mt-1">
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="repeat-outline" size={14} color="#9ca3af" />
                          <Text className="text-xs text-zinc-400">{ex.sets} Sets</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="barbell-outline" size={14} color="#9ca3af" />
                          <Text className="text-xs text-zinc-400">{ex.reps} Reps</Text>
                        </View>
                        {ex.weight && (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="fitness-outline" size={14} color="#9ca3af" />
                            <Text className="text-xs text-zinc-400">{ex.weight}kg</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity className="w-8 h-8 rounded-full items-center justify-center">
                      <Ionicons name="information-circle-outline" size={20} color="#3f3f46" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action — START WORKOUT */}
      {showWorkout && workout.status !== 'COMPLETED' && (
        <View className="absolute bottom-28 left-0 right-0 items-center pointer-events-none" style={{ pointerEvents: 'box-none' }}>
          <TouchableOpacity
            onPress={handleComplete}
            disabled={completeWorkout.isPending}
            className="flex-row items-center gap-2 bg-primary px-10 py-4 rounded-full"
            style={{
              shadowColor: '#b30f15',
              shadowOpacity: 0.4,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 12,
              pointerEvents: 'auto',
            }}
            activeOpacity={0.9}
          >
            {completeWorkout.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="white" />
                <Text className="text-white font-bold text-base tracking-wide">CONCLUIR TREINO</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Home indicator */}
      <View style={{ position: 'absolute', bottom: 4, alignSelf: 'center', width: 128, height: 4, backgroundColor: '#3f3f46', borderRadius: 999 }} />
    </View>
  );
}
