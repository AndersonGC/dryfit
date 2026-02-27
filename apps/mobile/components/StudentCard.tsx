import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import type { User, StudentWithWorkout } from '@dryfit/types';

export interface StudentCardProps {
    student: StudentWithWorkout;
    onPress: () => void;
    // Option to show "Ativo" fallback instead of workout status
    showOnlyActiveStatus?: boolean;
}

export const StudentCard = ({ student, onPress, showOnlyActiveStatus = false }: StudentCardProps) => {
    if (showOnlyActiveStatus) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                className="p-4 rounded-[28px] flex-row items-center justify-between mb-4 bg-[#0c0c0c] border border-zinc-900"
            >
                <View className="flex-row items-center gap-4">
                    <View className="w-14 h-14 rounded-[20px] bg-white items-center justify-center overflow-hidden">
                        {student.avatarUrl ? (
                            <Image source={{ uri: student.avatarUrl }} style={{ width: 56, height: 56 }} resizeMode="cover" />
                        ) : (
                            <Ionicons name="person" size={28} color="#71717a" />
                        )}
                    </View>
                    <View>
                        <Text className="font-extrabold text-[#f4f4f5] text-[17px] mb-0.5">
                            {student.name}
                        </Text>
                        <Text className="text-[13px] font-bold text-zinc-500">
                            {student.email}
                        </Text>
                    </View>
                </View>
                <View className="bg-zinc-800 px-3 py-1 rounded-full">
                    <Text className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Ativo</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const isEnviado = student.hasWorkout && student.workoutStatus !== 'COMPLETED';
    const isConcluido = student.workoutStatus === 'COMPLETED';
    const hasFeedback = isConcluido && !!student.studentFeedback;

    let statusText = 'Aguardando treino';
    let statusColor = 'text-zinc-500';
    let IconOverlay = null;

    if (hasFeedback) {
        statusText = 'Treino concluído';
        statusColor = 'text-green-500';
        IconOverlay = (
            <View className="absolute -top-2 -right-2 w-7 h-7 bg-[#ffd54f] rounded-full border-[3px] border-[#0c0c0c] items-center justify-center z-10 shadow-sm shadow-black/50">
                <FontAwesome6 name="exclamation" size={12} color="#0c0c0c" />
            </View>
        );
    } else if (isConcluido) {
        statusText = 'Treino concluído';
        statusColor = 'text-green-500';
        IconOverlay = (
            <View className="absolute -top-2 -right-2 w-7 h-7 bg-[#4ade80] rounded-full border-[3px] border-[#0c0c0c] items-center justify-center z-10 shadow-sm shadow-black/50">
                <FontAwesome6 name="check" size={12} color="#0c0c0c" />
            </View>
        );
    } else if (isEnviado) {
        statusText = 'Treino enviado';
        statusColor = 'text-zinc-500';
        IconOverlay = (
            <View className="absolute -top-2 -right-2 w-7 h-7 bg-[#4ade80] rounded-full border-[3px] border-[#0c0c0c] items-center justify-center z-10 shadow-sm shadow-black/50">
                <FontAwesome6 name="check" size={12} color="#0c0c0c" />
            </View>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className={`p-4 rounded-[28px] flex-row items-center justify-between mb-4 bg-[#0c0c0c] border border-zinc-900`}
        >
            <View className="flex-row items-center gap-4">
                <View className="w-14 h-14 relative visible">
                    <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center overflow-hidden">
                        {student.avatarUrl ? (
                            <Image source={{ uri: student.avatarUrl }} style={{ width: 56, height: 56 }} resizeMode="cover" />
                        ) : (
                            <Ionicons name="person" size={28} color="#71717a" />
                        )}
                    </View>
                    {IconOverlay}
                </View>
                <View>
                    <Text className="font-extrabold text-[#f4f4f5] text-[17px] mb-0.5">
                        {student.name}
                    </Text>
                    <Text className={`text-[13px] font-bold ${statusColor}`}>
                        {statusText}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#71717a" className="mr-2" />
        </TouchableOpacity>
    );
};
