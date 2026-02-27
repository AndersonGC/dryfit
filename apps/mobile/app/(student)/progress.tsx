import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabTransition } from '../../components/TabTransition';

export default function ProgressScreen() {
  return (
    <TabTransition index={2} className="flex-1 bg-[#0f1115] items-center justify-center">
      <Ionicons name="trending-up-outline" size={48} color="#3f3f46" />
      <Text className="text-zinc-500 mt-3 font-medium">Progresso em breve</Text>
    </TabTransition>
  );
}
