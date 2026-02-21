import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useStudents, useCreateWorkout } from '../../hooks/useWorkouts';
import type { User, WorkoutType } from '@dryfit/types';

const WORKOUT_TYPES: WorkoutType[] = ['STRENGTH', 'WOD', 'HIIT', 'CUSTOM'];
const WORKOUT_LABELS: Record<WorkoutType, string> = {
  STRENGTH: 'FOR TIME',
  WOD: 'WOD',
  HIIT: 'EMOM',
  CUSTOM: 'AMRAP',
};

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface StudentCardProps {
  student: User;
  isSelected: boolean;
  onSelect: () => void;
  onBuild: () => void;
}

const StudentCard = ({ student, isSelected, onSelect, onBuild }: StudentCardProps) => (
  <TouchableOpacity
    onPress={onSelect}
    activeOpacity={0.85}
    className={`p-4 rounded-3xl flex-row items-center justify-between mb-4 border ${isSelected
      ? 'bg-primary border-primary'
      : 'bg-zinc-900 border-zinc-800'
      }`}
    style={isSelected ? { shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 } : {}}
  >
    <View className="flex-row items-center gap-3">
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center ${isSelected ? 'bg-white/20 border border-white/20' : 'bg-zinc-800'
          }`}
      >
        <Ionicons name="person" size={28} color={isSelected ? 'white' : '#71717a'} />
      </View>
      <View>
        <Text className={`font-bold text-base ${isSelected ? 'text-white' : 'text-white'}`}>
          {student.name}
        </Text>
        <Text className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-zinc-500'}`}>
          Aluno ativo
        </Text>
      </View>
    </View>
    <TouchableOpacity
      onPress={onBuild}
      className={`px-4 py-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-primary'}`}
      style={!isSelected ? { shadowColor: '#b30f15', shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 } : {}}
    >
      <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-white'}`}>Build</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function CoachDashboard() {
  const { user } = useAuthStore();
  const { data: studentsData, isLoading: loadingStudents } = useStudents();
  const createWorkout = useCreateWorkout();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('STRENGTH');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const students: User[] = studentsData?.data?.students ?? [];

  const filteredStudents = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [students, search]
  );

  const openBuilder = useCallback((student: User) => {
    setSelectedStudent(student);
    setWorkoutTitle('');
    setWorkoutDescription('');
    setYoutubeVideoId('');
    setWorkoutDate(new Date());
    setModalVisible(true);
  }, []);

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: workoutDate,
        mode: 'date',
        onChange: (_event, date) => {
          if (date) setWorkoutDate(date);
        },
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  const handleCreate = async () => {
    if (!selectedStudent || !workoutTitle.trim()) {
      Alert.alert('Atenção', 'Título e aluno são obrigatórios.');
      return;
    }

    // Optional: Extract just the ID if the user pastes a full URL
    let parsedVideoId = youtubeVideoId.trim();
    if (parsedVideoId.includes('v=')) {
      parsedVideoId = parsedVideoId.split('v=')[1]?.split('&')[0] || parsedVideoId;
    } else if (parsedVideoId.includes('youtu.be/')) {
      parsedVideoId = parsedVideoId.split('youtu.be/')[1]?.split('?')[0] || parsedVideoId;
    }

    try {
      await createWorkout.mutateAsync({
        studentId: selectedStudent.id,
        title: workoutTitle.trim(),
        description: workoutDescription.trim(),
        youtubeVideoId: parsedVideoId || undefined,
        type: workoutType,
        scheduledAt: workoutDate.toISOString(),
      });
      setModalVisible(false);
      Alert.alert('✅ Treino criado!', `Treino enviado para ${selectedStudent.name}.`);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o treino.');
    }
  };

  const renderHeader = () => (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-sm text-zinc-400 font-medium">Welcome back,</Text>
          <Text className="text-2xl font-extrabold text-white tracking-tight">
            {user?.name?.split(' ')[0] ?? 'Trainer'}
          </Text>
        </View>
        <View className="relative">
          <View className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-primary items-center justify-center overflow-hidden">
            <Ionicons name="person" size={24} color="#b30f15" />
          </View>
          <View className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[#0a0a0a]" />
        </View>
      </View>

      {/* Search */}
      <View className="relative mb-8">
        <Ionicons name="search-outline" size={20} color="#71717a" style={{ position: 'absolute', left: 16, top: 14, zIndex: 1 }} />
        <TextInput
          className="w-full pl-12 pr-12 py-4 bg-zinc-900 rounded-2xl text-white"
          placeholder="Buscar aluno..."
          placeholderTextColor="#52525b"
          value={search}
          onChangeText={setSearch}
          style={{ fontSize: 15 }}
        />
        <Ionicons name="options-outline" size={20} color="#71717a" style={{ position: 'absolute', right: 16, top: 14 }} />
      </View>

      {/* Section title */}
      <View className="flex-row items-center justify-between mb-4 px-1">
        <Text className="text-lg font-bold text-white">Gerenciar Alunos</Text>
        <Text className="text-primary text-sm font-semibold">Ver todos</Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Status bar spacer */}
      <View className="h-14 bg-[#0a0a0a]/80" />

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loadingStudents ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#b30f15" />
            </View>
          ) : (
            <View className="items-center py-12">
              <Ionicons name="people-outline" size={48} color="#3f3f46" />
              <Text className="text-zinc-500 mt-3">Nenhum aluno encontrado</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <StudentCard
            student={item}
            isSelected={selectedStudent?.id === item.id}
            onSelect={() => setSelectedStudent((s) => (s?.id === item.id ? null : item))}
            onBuild={() => openBuilder(item)}
          />
        )}
      />

      {/* Workout Builder Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-[#0f1115]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-zinc-800">
            <View>
              <Text className="text-xs text-zinc-400 font-medium">Treino para</Text>
              <Text className="text-lg font-bold text-white">{selectedStudent?.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-zinc-800 rounded-full p-2">
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled">
            {/* Título */}
            <TextInput
              className="bg-zinc-900 border border-zinc-800 text-white px-4 py-4 rounded-2xl mb-4 text-base font-semibold"
              placeholder="Nome do treino..."
              placeholderTextColor="#52525b"
              value={workoutTitle}
              onChangeText={setWorkoutTitle}
            />

            {/* Data do Treino */}
            <TouchableOpacity
              onPress={openDatePicker}
              className="bg-zinc-900 border border-zinc-800 px-4 py-4 rounded-2xl mb-4 flex-row items-center gap-3"
            >
              <Ionicons name="calendar-outline" size={20} color="#71717a" />
              <Text className="text-white text-sm font-medium flex-1">
                {formatDateBR(workoutDate)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#71717a" />
            </TouchableOpacity>

            {/* iOS Date Picker inline */}
            {Platform.OS === 'ios' && showIOSPicker && (
              <View className="mb-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <DateTimePicker
                  value={workoutDate}
                  mode="date"
                  display="spinner"
                  onChange={(_event, date) => {
                    if (date) setWorkoutDate(date);
                  }}
                  style={{ height: 180 }}
                  themeVariant="dark"
                />
                <TouchableOpacity
                  onPress={() => setShowIOSPicker(false)}
                  className="items-center py-3 border-t border-zinc-800"
                >
                  <Text className="text-primary font-bold">Confirmar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tipo */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-2">
                {WORKOUT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setWorkoutType(t)}
                    className={`px-4 py-2 rounded-full ${workoutType === t ? 'bg-white' : 'bg-white/10'}`}
                  >
                    <Text className={`text-xs font-bold ${workoutType === t ? 'text-primary' : 'text-white'}`}>
                      {WORKOUT_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Nova Funcionalidade de Card: Descrição e YouTube Link */}
            <View className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg p-2">
              <TextInput
                className="text-white text-base px-3 pt-3 pb-8 text-left"
                placeholder="Descreva o treino livremente aqui... (Pressione OK no teclado para sair)"
                placeholderTextColor="#52525b"
                multiline={true}
                value={workoutDescription}
                onChangeText={setWorkoutDescription}
                style={{ minHeight: 120, textAlignVertical: 'top' }}
                blurOnSubmit={false}
              />

              <View className="mt-2 border-t border-zinc-800 pt-3 px-1 mb-1">
                <View className="flex-row items-center gap-2 bg-[#1c1f26] px-3 py-3 rounded-xl border border-zinc-800">
                  <Ionicons name="logo-youtube" size={20} color="#ff0000" />
                  <TextInput
                    className="flex-1 text-white text-sm"
                    placeholder="Link ou ID do vídeo no YouTube (opcional)"
                    placeholderTextColor="#52525b"
                    value={youtubeVideoId}
                    onChangeText={setYoutubeVideoId}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={createWorkout.isPending}
              className="w-full bg-primary py-4 rounded-2xl items-center mb-12 mt-2"
              style={{ shadowColor: '#b30f15', shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}
            >
              {createWorkout.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Enviar Treino</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
