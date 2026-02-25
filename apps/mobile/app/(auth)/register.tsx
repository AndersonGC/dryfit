import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useAlert } from '../../hooks/useCustomAlert';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !inviteCode) {
      showAlert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Atenção', 'As senhas não coincidem.');
      return;
    }
    setIsLoading(true);
    try {
      const userResult = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        inviteCode: inviteCode.toUpperCase(),
      });
      if (userResult?.role === 'COACH') {
        router.replace('/(coach)/dashboard');
      } else {
        router.replace('/(student)/dashboard');
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Código de convite inválido ou e-mail já cadastrado.';
      showAlert('Erro no Cadastro', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Background glows */}
      <View className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full" pointerEvents="none" />
      <View className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full" pointerEvents="none" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8" keyboardShouldPersistTaps="handled">
          <View className="h-12" />

          {/* Header */}
          <View className="mb-8">
            <TouchableOpacity onPress={() => router.back()} className="mb-6" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#a1a1aa" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white tracking-tight">Criar conta</Text>
            <Text className="text-zinc-400 mt-1 text-sm">Você precisa de um código de convite do seu coach.</Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            {/* Name */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">Nome completo</Text>
              <View className="relative">
                <Ionicons name="person-outline" size={20} color="#a1a1aa" style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl"
                  placeholder="Seu nome"
                  placeholderTextColor="#52525b"
                  value={name}
                  onChangeText={setName}
                  style={{ fontSize: 15 }}
                />
              </View>
            </View>

            {/* Email */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">E-mail</Text>
              <View className="relative">
                <Ionicons name="at-outline" size={20} color="#a1a1aa" style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
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
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">Senha</Text>
              <View className="relative">
                <Ionicons name="lock-closed-outline" size={20} color="#a1a1aa" style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-14 py-4 rounded-2xl"
                  placeholder="••••••••"
                  placeholderTextColor="#52525b"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={{ fontSize: 15 }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#71717a" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">Confirmar Senha</Text>
              <View className="relative">
                <Ionicons name="lock-closed-outline" size={20} color="#a1a1aa" style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl"
                  placeholder="••••••••"
                  placeholderTextColor="#52525b"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={{ fontSize: 15 }}
                />
              </View>
            </View>

            {/* Invite Code — destacado */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">Código de Convite</Text>
              <View className="relative">
                <Ionicons name="key-outline" size={20} color="#b30f15" style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full bg-primary/10 border border-primary/50 text-white pl-12 pr-4 py-4 rounded-2xl font-bold"
                  placeholder="DRFT-XXXXX"
                  placeholderTextColor="#b30f1580"
                  autoCapitalize="characters"
                  value={inviteCode}
                  onChangeText={(t) => setInviteCode(t.toUpperCase())}
                  style={{ fontSize: 16, letterSpacing: 2 }}
                />
              </View>
              <Text className="text-zinc-600 text-xs ml-1">Solicite ao seu coach o código de convite.</Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 mt-2"
              style={{ opacity: isLoading ? 0.7 : 1, shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base">Criar conta</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-end pb-10 items-center mt-8">
            <Text className="text-zinc-400 text-sm">
              Já tem uma conta?{' '}
              <Text className="text-primary font-bold" onPress={() => router.back()}>
                Fazer login
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View className="w-32 h-1 bg-zinc-800 rounded-full self-center mb-2" />
    </View>
  );
}
