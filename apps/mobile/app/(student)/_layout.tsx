import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STUDENT_TABS = [
  { name: 'dashboard', icon: 'home-outline' as const, activeIcon: 'home' as const, label: 'Home' },
  { name: 'explore', icon: 'compass-outline' as const, activeIcon: 'compass' as const, label: 'Explore' },
  { name: 'progress', icon: 'trending-up-outline' as const, activeIcon: 'trending-up' as const, label: 'Progress' },
  { name: 'scan', icon: 'qr-code-outline' as const, activeIcon: 'qr-code' as const, label: 'Scan' },
  { name: 'profile', icon: 'person-outline' as const, activeIcon: 'person' as const, label: 'Perfil' },
];

function StudentTabBar({ state, navigation }: { state: { index: number; routes: Array<{ name: string }> }; navigation: { emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean }; navigate: (n: string) => void } }) {
  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-zinc-800/80 pb-8 pt-3 px-8"
      style={{ backgroundColor: 'rgba(15,17,21,0.85)' }}
    >
      <View className="flex-row justify-between items-center">
        {STUDENT_TABS.map((tab, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: state.routes[index]?.name ?? tab.name, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(tab.name);
          };
          return (
            <TouchableOpacity key={tab.name} className="items-center gap-1" onPress={onPress} activeOpacity={0.7}>
              <Ionicons
                name={isFocused ? tab.activeIcon : tab.icon}
                size={24}
                color={isFocused ? '#b30f15' : '#6b7280'}
              />
              <Text style={{ fontSize: 10, fontWeight: isFocused ? 'bold' : '500', color: isFocused ? '#b30f15' : '#6b7280' }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function StudentLayout() {
  return (
    <Tabs
      tabBar={(props) => <StudentTabBar state={props.state} navigation={props.navigation} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
