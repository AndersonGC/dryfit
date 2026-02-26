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
import { useAlert } from '../../hooks/useCustomAlert';
import { api } from '../../lib/api';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email) {
            showAlert('Atenção', 'Preencha o e-mail.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/verify-email/send', { email: email.trim().toLowerCase() });
            setIsCodeSent(true);
            showAlert('Código enviado', 'Verifique sua caixa de entrada.');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Erro ao enviar o código.';
            showAlert('Erro', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code || code.length !== 6) {
            showAlert('Atenção', 'O código deve ter 6 dígitos.');
            return;
        }

        setIsLoading(true);
        try {
            const resp = await api.post<{ verificationToken: string }>('/auth/verify-email/confirm', {
                email: email.trim().toLowerCase(),
                code,
            });

            const { verificationToken } = resp.data;
            // Navigate to register screen with the token
            router.push({
                pathname: '/(auth)/register',
                params: { email: email.trim().toLowerCase(), token: verificationToken },
            });
        } catch (error: any) {
            const message = error.response?.data?.error || 'Código inválido ou expirado.';
            showAlert('Erro', message);
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
                        <Text className="text-2xl font-bold text-white tracking-tight">Verificar E-mail</Text>
                        <Text className="text-zinc-400 mt-1 text-sm">
                            {isCodeSent
                                ? 'Insira o código de 6 dígitos enviado para o seu e-mail.'
                                : 'Para criar uma conta, precisamos validar seu e-mail.'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="gap-5">
                        {/* Email */}
                        <View className="gap-2">
                            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">E-mail</Text>
                            <View className="relative">
                                <Ionicons name="at-outline" size={20} color={isCodeSent ? "#52525b" : "#a1a1aa"} style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
                                <TextInput
                                    className={`w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl ${isCodeSent ? 'opacity-50' : ''}`}
                                    placeholder="name@email.com"
                                    placeholderTextColor="#52525b"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isCodeSent}
                                    style={{ fontSize: 15 }}
                                />
                            </View>
                        </View>

                        {/* Code */}
                        {isCodeSent && (
                            <View className="gap-2 focus:mt-2">
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">Código de 6 dígitos</Text>
                                <View className="relative">
                                    <Ionicons name="key-outline" size={20} color="#b30f15" style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
                                    <TextInput
                                        className="w-full bg-primary/10 border border-primary/50 text-white pl-12 pr-4 py-4 rounded-2xl font-bold"
                                        placeholder="000000"
                                        placeholderTextColor="#b30f1580"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        value={code}
                                        onChangeText={setCode}
                                        style={{ fontSize: 16, letterSpacing: 8, textAlign: 'center' }}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Action Button */}
                        <TouchableOpacity
                            onPress={isCodeSent ? handleVerifyCode : handleSendCode}
                            disabled={isLoading}
                            className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 mt-2"
                            style={{ opacity: isLoading ? 0.7 : 1, shadowColor: '#b30f15', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
                            activeOpacity={0.9}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white font-bold text-base">{isCodeSent ? 'Validar Código' : 'Enviar Código'}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="white" />
                                </>
                            )}
                        </TouchableOpacity>

                        {isCodeSent && !isLoading && (
                            <TouchableOpacity onPress={() => setIsCodeSent(false)} className="mt-4 items-center">
                                <Text className="text-zinc-400 text-sm">Digitar e-mail novamente</Text>
                            </TouchableOpacity>
                        )}
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
