import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useStudentsByDate, useCreateWorkout, toLocalDateString } from '../../hooks/useWorkouts';
import { useAlert } from '../../hooks/useCustomAlert';
import { StudentCard, type StudentWithWorkout } from '../../components/StudentCard';
import { CustomDatePickerModal } from '../../components/CustomDatePickerModal';
import type { User, WorkoutType } from '@dryfit/types';

const WORKOUT_TYPES: WorkoutType[] = ['STRENGTH', 'WOD', 'HIIT', 'CUSTOM'];
const WORKOUT_LABELS: Record<WorkoutType, string> = {
  STRENGTH: 'FOR TIME',
  WOD: 'WOD',
  HIIT: 'EMOM',
  CUSTOM: 'AMRAP',
};



function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TODAY = new Date();

function buildDays() {
  const currentDay = TODAY.getDay(); // 0 is Sunday
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  const daysToSubtract = 28 + daysFromMonday; // Go back 4 weeks

  const days = [];
  for (let i = 0; i < 63; i++) { // Generate 9 full weeks
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

export default function CoachDashboard() {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const { showAlert } = useAlert();
  const createWorkout = useCreateWorkout();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('STRENGTH');
  const [workoutDescription, setWorkoutDescription] = useState('');

  // Dashboard date controller
  const [dashboardDate, setDashboardDate] = useState<Date>(new Date());

  // Modal date controller (prefilled with dashboard date when opening)
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modal for Feedback
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<StudentWithWorkout | null>(null);

  const { data: studentsData, isLoading: loadingStudents, refetch: refetchStudents } = useStudentsByDate(toLocalDateString(dashboardDate));
  const students: StudentWithWorkout[] = (studentsData?.data as any)?.students ?? [];

  useFocusEffect(
    useCallback(() => {
      refetchStudents();
    }, [refetchStudents])
  );

  const filteredStudents = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [students, search]
  );

  const openBuilder = useCallback((student: User) => {
    setSelectedStudent(student);
    setWorkoutTitle('');
    setWorkoutDescription('');
    setWorkoutDate(dashboardDate); // Pre-select the date that the coach was looking at
    setModalVisible(true);
  }, [dashboardDate]);

  const handleCardPress = useCallback((student: StudentWithWorkout) => {
    if (student.workoutStatus === 'COMPLETED' && student.studentFeedback) {
      setSelectedStudentForFeedback(student);
      setFeedbackModalVisible(true);
    } else {
      openBuilder(student as User);
    }
  }, [openBuilder]);

  const handleCreate = async () => {
    if (!selectedStudent || !workoutTitle.trim()) {
      showAlert('Atenção', 'Título e aluno são obrigatórios.');
      return;
    }

    try {
      await createWorkout.mutateAsync({
        studentId: selectedStudent.id,
        title: workoutTitle.trim(),
        description: workoutDescription.trim(),
        type: workoutType,
        scheduledAt: `${toLocalDateString(workoutDate)}T12:00:00.000Z`,
      });
      setModalVisible(false);
      showAlert('✅ Treino criado!', `Treino enviado para ${selectedStudent.name}.`);
    } catch {
      showAlert('Erro', 'Não foi possível criar o treino.');
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
      <View className="relative mb-6">
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

      {/* Calendário — Semanal */}
      <View className="mb-6 -mx-5 px-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-bold text-lg text-white">Selecionar Data</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="chevron-back" size={14} color="#71717a" />
            <Text className="text-zinc-300 text-sm font-medium capitalize">
              {dashboardDate.toLocaleString('pt-BR', { month: 'long' })}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#71717a" />
          </View>
        </View>

        <FlatList
          data={ALL_DAYS}
          keyExtractor={(item) => item.date.toDateString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width - 40}
          snapToAlignment="start"
          decelerationRate="fast"
          initialScrollIndex={Math.floor(TODAY_INDEX / 7) * 7}
          getItemLayout={(_, index) => ({
            length: (width - 40) / 7,
            offset: ((width - 40) / 7) * index,
            index,
          })}
          renderItem={({ item }) => {
            const isSelected = isSameDay(item.date, dashboardDate);
            return (
              <TouchableOpacity
                onPress={() => setDashboardDate(item.date)}
                activeOpacity={0.8}
                style={{
                  width: (width - 40) / 7,
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
                  {item.isToday && (
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : '#b30f15', marginTop: 4, position: 'absolute', bottom: 6, zIndex: 1 }} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Section title */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-white">Alunos da Equipe</Text>
        <Text className="text-primary text-sm font-semibold">{filteredStudents.length} total</Text>
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
            onPress={() => handleCardPress(item)}
          />
        )}
      />

      {/* Workout Builder Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
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
              onPress={() => setShowDatePicker(true)}
              className="bg-zinc-900 border border-zinc-800 px-4 py-4 rounded-2xl mb-4 flex-row items-center gap-3"
            >
              <Ionicons name="calendar-outline" size={20} color="#71717a" />
              <Text className="text-white text-sm font-medium flex-1">
                {formatDateBR(workoutDate)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#71717a" />
            </TouchableOpacity>

            <CustomDatePickerModal
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              date={workoutDate}
              onSelectDate={setWorkoutDate}
            />

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

            {/* Descrição */}
            <View className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg p-2">
              <TextInput
                className="text-white text-base px-3 pt-3 pb-8 text-left"
                placeholder="Descreva o treino livremente aqui..."
                placeholderTextColor="#52525b"
                multiline={true}
                value={workoutDescription}
                onChangeText={setWorkoutDescription}
                style={{ minHeight: 120, textAlignVertical: 'top' }}
                blurOnSubmit={false}
              />
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

      {/* Observation Modal */}
      <Modal
        visible={feedbackModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/60 px-6"
          activeOpacity={1}
          onPress={() => setFeedbackModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ width: '100%', maxWidth: 384, backgroundColor: '#1c1f26', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-12 h-12 bg-red-900/30 rounded-2xl items-center justify-center">
                <Ionicons name="chatbubble-outline" size={24} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-white flex-1 leading-tight">
                Student Feedback
                {'\n'}
                <Text className="text-zinc-400 text-sm font-medium">{selectedStudentForFeedback?.name}</Text>
              </Text>
            </View>

            <View className="bg-[#27272a] rounded-2xl py-5 px-5 min-h-[120px]">
              <Text className="text-zinc-300 text-base leading-relaxed italic">
                &quot;{selectedStudentForFeedback?.studentFeedback}&quot;
              </Text>
            </View>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
