import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useAuthStore } from '../../store/auth.store';
import { useActiveWorkout, useCompleteWorkout, toLocalDateString } from '../../hooks/useWorkouts';
import { WeekCalendar } from '../../components/WeekCalendar';
import { useAlert } from '../../hooks/useCustomAlert';
import type { WorkoutType } from '@dryfit/types';

const WORKOUT_LABELS: Record<WorkoutType, string> = {
  STRENGTH: 'FOR TIME',
  WOD: 'WOD',
  HIIT: 'EMOM',
  CUSTOM: 'AMRAP',
};



export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const { showAlert } = useAlert();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [observation, setObservation] = useState('');
  const [forceDetails, setForceDetails] = useState(false);

  // Reset view mode when date changes
  useEffect(() => {
    setForceDetails(false);
  }, [selectedDate]);

  const formattedDate = toLocalDateString(selectedDate);
  const { data: workoutRes, isLoading, refetch: refetchWorkout } = useActiveWorkout(formattedDate);
  const completeWorkout = useCompleteWorkout(formattedDate);

  useFocusEffect(
    useCallback(() => {
      refetchWorkout();
    }, [refetchWorkout])
  );

  const workout = workoutRes?.data?.workout;

  const handleComplete = useCallback(() => {
    if (!workout) return;
    setObservation('');
    setCompleteModalVisible(true);
  }, [workout]);

  const confirmComplete = async () => {
    if (!workout) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await completeWorkout.mutateAsync({
        workoutId: workout.id,
        studentFeedback: observation.trim() || undefined
      });
      setCompleteModalVisible(false);
    } catch {
      showAlert('Erro', 'Não foi possível marcar o treino como concluído.');
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Workout for the selected day
  const showWorkout = !!workout;

  const [playing, setPlaying] = useState(false);
  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const renderDescription = () => {
    let descriptionText = workout?.description || '';
    const videoIdField = workout?.youtubeVideoId || '';

    if (videoIdField) {
      const isUrl = /(?:youtu\.be\/|youtube\.com\/)/.test(videoIdField);
      const isDirectId = videoIdField.length === 11 && !isUrl;

      if (isDirectId) {
        if (!descriptionText.includes(videoIdField)) {
          descriptionText += `\nhttps://youtu.be/${videoIdField}`;
        }
      } else {
        if (!descriptionText.includes(videoIdField)) {
          descriptionText += `\n${videoIdField}`;
        }
      }
    }

    if (!descriptionText.trim()) return null;

    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})\S*/g;

    const parts: Array<{ type: 'text'; content: string } | { type: 'video'; videoId: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(descriptionText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: descriptionText.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'video', videoId: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < descriptionText.length) {
      parts.push({ type: 'text', content: descriptionText.substring(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.type === 'text') {
        const text = part.content.trim();
        if (!text) return null;
        return (
          <Text key={`text-${index}`} className="text-zinc-300 text-base leading-relaxed mb-4 mt-2">
            {text}
          </Text>
        );
      } else if (part.type === 'video') {
        return (
          <View key={`video-${index}`} className="rounded-2xl overflow-hidden mt-2 mb-6 bg-black border border-zinc-800">
            <YoutubePlayer
              height={200}
              play={playing}
              videoId={part.videoId}
              onChangeState={onStateChange}
              initialPlayerParams={{
                preventFullScreen: true,
                modestbranding: 1,
                rel: 0
              }}
            />
          </View>
        );
      }
    });
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

        {/* Calendário — Semanal */}
        <WeekCalendar
          title="Calendário"
          className="mb-8"
          date={selectedDate}
          onChange={setSelectedDate}
        />

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
          ) : workout.status === 'COMPLETED' && !forceDetails ? (
            <View className="flex-1 items-center justify-center py-[20%]">
              <View className="w-28 h-28 rounded-full border-4 border-[#3a1316] items-center justify-center mb-10 relative bg-[#611014]/20">
                <View className="absolute -left-4 w-6 h-12 border-l-2 border-t-2 border-b-2 border-[#b30f15] rounded-l-full opacity-60" />
                <View className="absolute -right-4 w-6 h-12 border-r-2 border-t-2 border-b-2 border-[#b30f15] rounded-r-full opacity-60" />
                <View className="absolute -bottom-6 w-16 h-4 border-b-2 border-l-2 border-r-2 border-[#b30f15] rounded-b-full opacity-60" />

                <View className="w-20 h-20 bg-[#b30f15] rounded-full items-center justify-center shadow-lg shadow-black">
                  <Ionicons name="checkmark" size={54} color="white" />
                </View>
              </View>

              <Text className="font-black text-[28px] text-white tracking-widest uppercase mb-2">TREINO CONCLUÍDO!</Text>
              <Text className="text-zinc-400 text-base mb-16">Você superou seus limites hoje.</Text>

              <TouchableOpacity
                onPress={() => setForceDetails(true)}
                className="py-3 px-6 rounded-2xl border border-zinc-800 bg-[#1c1f26]"
              >
                <Text className="text-zinc-300 font-bold">Ver detalhes do treino</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* WOD Hero */}
              <View className="w-full min-h-[176px] rounded-3xl overflow-hidden mb-6 bg-zinc-900/40">
                {/* Backdrops */}
                <View className="absolute inset-0 items-center justify-center opacity-40">
                  <Ionicons name="barbell" size={140} color="#1c1f26" />
                </View>
                <View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-0" />

                {/* Content */}
                <View className="relative z-10 p-6 flex-1 justify-center">
                  <View className="bg-primary px-3 py-1.5 rounded-lg mb-3 self-start">
                    <Text className="text-[11px] font-bold text-white uppercase tracking-wider">
                      {WORKOUT_LABELS[workout.type] || workout.type}
                    </Text>
                  </View>
                  <Text className="text-3xl font-extrabold text-white mb-2 tracking-tight">{workout.title}</Text>

                  {renderDescription()}
                </View>
              </View>

              {/* Status de Conclusão */}
              {workout.status === 'COMPLETED' && (
                <View className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                  <Text className="text-green-400 font-bold text-base">Treino concluído hoje!</Text>
                </View>
              )}

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

              {/* START WORKOUT ACTION */}
              {showWorkout && workout.status !== 'COMPLETED' && (
                <View className="mt-8 items-center w-full">
                  <TouchableOpacity
                    onPress={handleComplete}
                    disabled={completeWorkout.isPending}
                    className="flex-row items-center justify-center gap-2 bg-primary px-10 py-4 rounded-full w-full"
                    style={{
                      shadowColor: '#b30f15',
                      shadowOpacity: 0.4,
                      shadowRadius: 16,
                      shadowOffset: { width: 0, height: 6 },
                      elevation: 12,
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
            </>
          )}
        </View>
      </ScrollView>

      {/* Home indicator */}
      <View style={{ position: 'absolute', bottom: 4, alignSelf: 'center', width: 128, height: 4, backgroundColor: '#3f3f46', borderRadius: 999 }} />

      {/* Observation Modal */}
      <Modal
        visible={completeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCompleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <TouchableOpacity
            style={{ width: '100%', maxWidth: 384, backgroundColor: '#1c1f26', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            activeOpacity={1}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Concluir Treino</Text>
              <TouchableOpacity onPress={() => setCompleteModalVisible(false)} className="bg-zinc-800 rounded-full p-2">
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-zinc-400 mb-4">
              Como foi o treino? Deixe uma observação para o seu coach (opcional).
            </Text>

            <TextInput
              className="bg-zinc-900 border border-zinc-800 text-white px-4 py-4 rounded-2xl mb-6 text-base"
              multiline={true}
              numberOfLines={4}
              value={observation}
              onChangeText={setObservation}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />

            <TouchableOpacity
              onPress={confirmComplete}
              disabled={completeWorkout.isPending}
              className="w-full bg-primary py-4 rounded-2xl items-center"
              style={{ shadowColor: '#b30f15', shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}
            >
              {completeWorkout.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Enviar</Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
