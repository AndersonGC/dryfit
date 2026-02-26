import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

function CoachTabBar({ state, navigation }: { state: { index: number; routes: Array<{ name: string }> }; navigation: any }) {
  const router = useRouter();

  const tabs = [
    { name: 'dashboard', icon: 'home-outline' as const, label: 'Home' },
    { name: 'students', icon: 'people-outline' as const, label: 'Alunos' },
    { name: '__builder__', icon: 'add' as const, label: 'BUILDER', isFab: true },
    { name: 'stats', icon: 'bar-chart-outline' as const, label: 'Stats' },
    { name: 'settings', icon: 'settings-outline' as const, label: 'Config' },
  ];

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center px-8 pt-4 pb-8 border-t border-zinc-800/80"
      style={{ backgroundColor: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)' }}
    >
      {tabs.map((tab, index) => {
        if (tab.isFab) {
          return (
            <TouchableOpacity
              key="fab"
              className="items-center"
              onPress={() => router.push('/(coach)/builder')}
              activeOpacity={0.85}
            >
              <View
                className="bg-primary items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  marginTop: -36,
                  borderWidth: 4,
                  borderColor: '#0a0a0a',
                  shadowColor: '#b30f15',
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 12,
                }}
              >
                <Ionicons name="add" size={30} color="white" />
              </View>
              <Text className="text-[10px] font-extrabold text-primary mt-1">BUILDER</Text>
            </TouchableOpacity>
          );
        }

        // Routes: [dashboard(0), students(1), builder(2), stats(3), settings(4)]
        const routeIndex = index;
        const isFocused = state.index === routeIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[routeIndex]?.name ?? tab.name,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        return (
          <TouchableOpacity key={tab.name} className="items-center gap-1" onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={tab.icon} size={24} color={isFocused ? '#b30f15' : '#71717a'} />
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: isFocused ? '#b30f15' : '#71717a' }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CoachLayout() {
  return (
    <Tabs
      tabBar={(props) => <CoachTabBar state={props.state} navigation={props.navigation} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="students" />
      <Tabs.Screen name="builder" options={{ href: null }} />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
