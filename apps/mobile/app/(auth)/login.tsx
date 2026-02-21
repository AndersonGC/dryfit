import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'E-mail ou senha incorretos.';
      Alert.alert('Erro no Login', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Background glows */}
      <View
        className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full"
        style={{ filter: undefined }}
        pointerEvents="none"
      />
      <View
        className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full"
        pointerEvents="none"
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Status bar spacer */}
          <View className="h-12" />

          {/* Logo */}
          <View className="items-center mb-10 mt-4">
            <Image
              source={require('../../assets/images/icon.png')}
              style={{ width: 112, height: 112, borderRadius: 28, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-white tracking-tight">
              DryFit
            </Text>
            <Text className="text-zinc-400 mt-1 text-sm">
              Treine mais. Evolua sempre.
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            {/* Email */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">
                Email Address
              </Text>
              <View className="relative">
                <Ionicons
                  name="at-outline"
                  size={20}
                  color="#a1a1aa"
                  style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }}
                />
                <TextInput
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl"
                  placeholder="name@email.com"
                  placeholderTextColor="#52525b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={{ fontSize: 15 }}
                />
              </View>
            </View>

            {/* Password */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">
                Password
              </Text>
              <View className="relative">
                <Ionicons
                  name="lock-open-outline"
                  size={20}
                  color="#a1a1aa"
                  style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }}
                />
                <TextInput
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-14 py-4 rounded-2xl"
                  placeholder="••••••••"
                  placeholderTextColor="#52525b"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={{ fontSize: 15 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#71717a"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot */}
            <View className="items-end -mt-2">
              <Text className="text-primary text-sm font-medium">Esqueceu a senha?</Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2"
              style={{ opacity: isLoading ? 0.7 : 1, shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base">Log In</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="mt-8 mb-6 flex-row items-center gap-4">
            <View className="h-px flex-1 bg-zinc-800" />
            <Text className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Ou acesse com
            </Text>
            <View className="h-px flex-1 bg-zinc-800" />
          </View>

          {/* Sign Up Link */}
          <View className="flex-1 justify-end pb-10 items-center">
            <Text className="text-zinc-400 text-sm">
              Não tem uma conta?{' '}
              <Text
                className="text-primary font-bold"
                onPress={() => router.push('/(auth)/register')}
              >
                Criar conta
              </Text>
            </Text>
            <Text className="text-zinc-600 text-xs mt-3 text-center">
              Professor? Use as credenciais fornecidas pelos administradores.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Home indicator */}
      <View className="w-32 h-1 bg-zinc-800 rounded-full self-center mb-2" />
    </View>
  );
}
