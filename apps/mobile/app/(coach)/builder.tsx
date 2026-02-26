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
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useStudentsByDate, useCreateWorkout, useUpdateWorkout, useDeleteWorkout, toLocalDateString } from '../../hooks/useWorkouts';
import { useAlert } from '../../hooks/useCustomAlert';
import { StudentCard } from '../../components/StudentCard';
import { CustomDatePickerModal } from '../../components/CustomDatePickerModal';
import { WeekCalendar } from '../../components/WeekCalendar';
import type { User, WorkoutType, StudentWithWorkout } from '@dryfit/types';

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



export default function CoachBuilderScreen() {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const { showAlert } = useAlert();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithWorkout | null>(null);
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

  const openBuilder = useCallback((student: StudentWithWorkout) => {
    setSelectedStudent(student);
    setWorkoutTitle(student.workoutTitle || '');
    setWorkoutDescription(student.workoutDescription || '');
    setWorkoutType((student.workoutType as WorkoutType) || 'STRENGTH');
    setWorkoutDate(dashboardDate); // Pre-select the date that the coach was looking at
    setModalVisible(true);
  }, [dashboardDate]);

  const handleCardPress = useCallback((student: StudentWithWorkout) => {
    if (student.workoutStatus === 'COMPLETED') {
      if (student.studentFeedback) {
        setSelectedStudentForFeedback(student);
        setFeedbackModalVisible(true);
      } else {
        showAlert('Aviso', 'Este treino já foi concluído pelo aluno e não pode ser alterado.');
      }
    } else {
      openBuilder(student);
    }
  }, [openBuilder, showAlert]);

  const handleSave = async () => {
    if (!selectedStudent || !workoutTitle.trim()) {
      showAlert('Atenção', 'Título e aluno são obrigatórios.');
      return;
    }

    try {
      if (selectedStudent.workoutId) {
        await updateWorkout.mutateAsync({
          workoutId: selectedStudent.workoutId,
          title: workoutTitle.trim(),
          description: workoutDescription.trim(),
          type: workoutType,
          date: toLocalDateString(workoutDate),
        });
        showAlert('✅ Sucesso!', `O treino de ${selectedStudent.name} foi atualizado.`);
      } else {
        await createWorkout.mutateAsync({
          studentId: selectedStudent.id,
          title: workoutTitle.trim(),
          description: workoutDescription.trim(),
          type: workoutType,
          scheduledAt: `${toLocalDateString(workoutDate)}T12:00:00.000Z`,
        });
        showAlert('✅ Treino criado!', `Treino enviado para ${selectedStudent.name}.`);
      }
      setModalVisible(false);
    } catch {
      showAlert('Erro', 'Não foi possível salvar o treino.');
    }
  };

  const confirmDelete = () => {
    showAlert(
      'Excluir Treino',
      `Tem certeza que deseja remover o treino de ${selectedStudent?.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: executeDelete }
      ]
    );
  };

  const executeDelete = async () => {
    if (!selectedStudent?.workoutId) return;

    try {
      await deleteWorkout.mutateAsync({
        workoutId: selectedStudent.workoutId,
        date: toLocalDateString(workoutDate),
      });
      setModalVisible(false);
      showAlert('🗑️ Excluído', `O treino de ${selectedStudent.name} foi removido.`);
    } catch {
      showAlert('Erro', 'Não foi possível excluir o treino.');
    }
  };

  const renderHeader = () => (
    <>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-extrabold text-white tracking-tight">Builder</Text>
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
      <WeekCalendar
        title="Selecionar Data"
        date={dashboardDate}
        onChange={setDashboardDate}
        className="mb-6 -mx-5 px-5"
      />

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
        ListHeaderComponent={renderHeader()}
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

            {selectedStudent?.workoutId && (
              <TouchableOpacity
                onPress={confirmDelete}
                disabled={deleteWorkout.isPending}
                className="w-full border border-red-500 py-3 rounded-2xl items-center mb-4 bg-transparent"
              >
                {deleteWorkout.isPending ? (
                  <ActivityIndicator color="#ef4444" />
                ) : (
                  <Text className="text-red-500 font-bold text-sm">Excluir Treino</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSave}
              disabled={createWorkout.isPending || updateWorkout.isPending}
              className="w-full bg-primary py-4 rounded-2xl items-center mb-12"
              style={{ shadowColor: '#b30f15', shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}
            >
              {createWorkout.isPending || updateWorkout.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {selectedStudent?.workoutId ? 'Atualizar Treino' : 'Enviar Treino'}
                </Text>
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
