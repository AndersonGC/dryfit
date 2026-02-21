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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/auth.store';
import { useActiveWorkout, useCompleteWorkout } from '../../hooks/useWorkouts';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DAYS_BEFORE = 30;
const DAYS_AFTER = 60;
const TODAY = new Date();

/** Returns YYYY-MM-DD in UTC for a given Date */
function toUTCDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDays() {
  return Array.from({ length: DAYS_BEFORE + DAYS_AFTER + 1 }, (_, i) => {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() - DAYS_BEFORE + i);
    return {
      date: new Date(d),
      day: DAY_LABELS[d.getDay()],
      num: d.getDate(),
      isToday: d.toDateString() === TODAY.toDateString(),
    };
  });
}

const ALL_DAYS = buildDays();
const TODAY_INDEX = DAYS_BEFORE;

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const calendarRef = useRef<FlatList>(null);

  // Date key in UTC format — drives both the query and the cache key
  const selectedDateKey = toUTCDateString(selectedDate);

  const { data: workoutRes, isLoading } = useActiveWorkout(selectedDateKey);
  const completeWorkout = useCompleteWorkout(selectedDateKey);

  // Fixed item width: show ~5 days at a time with gap
  const DAY_GAP = 4;
  const dayItemWidth = (width - 40 - DAY_GAP * 4) / 5;

  // Scroll to today when calendar mounts
  useEffect(() => {
    setTimeout(() => {
      calendarRef.current?.scrollToIndex({ index: TODAY_INDEX, animated: false, viewPosition: 0.5 });
    }, 100);
  }, []);

  const workout = workoutRes?.data?.workout;
  const monthName = selectedDate.toLocaleString('pt-BR', { month: 'long' });

  // Show workout card whenever there IS a workout for the selected date —
  // regardless of status (PENDING or COMPLETED) or whether it's today.
  const showWorkout = !!workout;

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

        {/* Calendário — 5 dias */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-primary text-sm font-medium capitalize">{monthName}</Text>
          </View>

          <FlatList
            ref={calendarRef}
            data={ALL_DAYS}
            keyExtractor={(item) => item.date.toDateString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: DAY_GAP, paddingHorizontal: 0 }}
            getItemLayout={(_, index) => ({
              length: dayItemWidth + DAY_GAP,
              offset: (dayItemWidth + DAY_GAP) * index,
              index,
            })}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(() => {
                calendarRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
              }, 200);
            }}
            renderItem={({ item }) => {
              const isSelected = isSameDay(item.date, selectedDate);
              return (
                <TouchableOpacity
                  onPress={() => setSelectedDate(item.date)}
                  activeOpacity={0.8}
                  style={{
                    width: dayItemWidth,
                    height: 88,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 16,
                    backgroundColor: isSelected ? '#b30f15' : '#1c1f26',
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: '#27272a',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: isSelected ? 'rgba(255,255,255,0.8)' : '#a1a1aa', marginBottom: 2 }}>
                    {item.day}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff' }}>
                    {item.num}
                  </Text>
                  {/* Dot: visible space reserved to prevent layout shift */}
                  <View style={{
                    width: 6, height: 6, borderRadius: 3, marginTop: 4,
                    backgroundColor: 'transparent', // dots removed — date filtering handles this
                  }} />
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
              <Text className="text-white font-bold mt-4 text-lg">Sem treino nessa data</Text>
              <Text className="text-zinc-500 text-sm mt-2 text-center">
                Seu coach ainda não enviou treino para esse dia. Descanse bem!
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
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider">{workout.type}</Text>
                  </View>
                  <Text className="text-2xl font-bold text-white">{workout.title}</Text>
                  <Text className="text-zinc-300 text-sm mt-1">
                    {workout.coach?.name ? `Enviado por ${workout.coach.name}` : 'Enviado pelo seu Coach'}
                  </Text>
                </View>
                <View className="absolute top-4 right-4 z-20 bg-white/10 rounded-full px-3 py-1 flex-row items-center gap-1">
                  <Ionicons name="flame" size={14} color="white" />
                  <Text className="text-white text-xs font-medium">480 kcal</Text>
                </View>
                <View className="flex-1 bg-zinc-900 items-center justify-center">
                  <Ionicons name="barbell" size={80} color="#1c1f26" />
                </View>
              </View>

              {/* Completion banner — shown whenever status is COMPLETED */}
              {workout.status === 'COMPLETED' && (
                <View className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3 mb-4 flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text className="text-green-400 font-bold">Treino concluído! 🎉</Text>
                </View>
              )}

              <Text className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                Exercícios ({workout.exercises?.length ?? 0})
              </Text>

              <View className="gap-3">
                {(workout.exercises ?? []).map((ex, i) => (
                  <View
                    key={ex.id ?? i}
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

      {/* Floating Action — CONCLUIR TREINO (only visible when workout is PENDING) */}
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
                <Ionicons name="checkmark-circle" size={20} color="white" />
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
