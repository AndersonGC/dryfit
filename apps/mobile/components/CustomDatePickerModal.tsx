import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomDatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    date: Date;
    onSelectDate: (date: Date) => void;
}

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export function CustomDatePickerModal({ visible, onClose, date, onSelectDate }: CustomDatePickerModalProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));

    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

    const days = useMemo(() => {
        const list = [];
        // Espaços vazios no começo do mês
        for (let i = 0; i < firstDay; i++) {
            list.push(null);
        }
        // Dias do mês
        for (let i = 1; i <= daysInMonth; i++) {
            list.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
        }
        return list;
    }, [currentMonth, daysInMonth, firstDay]);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isSelected = (d: Date | null) => {
        if (!d) return false;
        return d.toDateString() === date.toDateString();
    };

    const isToday = (d: Date | null) => {
        if (!d) return false;
        return d.toDateString() === new Date().toDateString();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/60 px-5">
                <View className="bg-[#1c1f26] w-full max-w-[360px] rounded-[32px] p-6 border border-zinc-800 shadow-2xl">

                    {/* Header do Calendário */}
                    <View className="flex-row items-center justify-between mb-6 pt-2">
                        <TouchableOpacity onPress={handlePrevMonth} className="p-2 rounded-full overflow-hidden active:bg-zinc-800">
                            <Ionicons name="chevron-back" size={24} color="#e4e4e7" />
                        </TouchableOpacity>

                        <Text className="text-white font-bold text-lg capitalize tracking-wide">
                            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </Text>

                        <TouchableOpacity onPress={handleNextMonth} className="p-2 rounded-full overflow-hidden active:bg-zinc-800">
                            <Ionicons name="chevron-forward" size={24} color="#e4e4e7" />
                        </TouchableOpacity>
                    </View>

                    {/* Dias da Semana */}
                    <View className="flex-row justify-between mb-4 px-1">
                        {WEEK_DAYS.map((day, i) => (
                            <View key={`wd-${i}`} className="w-10 items-center justify-center">
                                <Text className="text-zinc-500 font-bold text-xs">{day}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Grid de Dias */}
                    <View className="flex-row flex-wrap justify-between px-1">
                        {days.map((d, index) => {
                            if (!d) {
                                return <View key={`empty-${index}`} className="w-10 h-10 mb-2" />;
                            }

                            const selected = isSelected(d);
                            const today = isToday(d);

                            return (
                                <TouchableOpacity
                                    key={d.toISOString()}
                                    onPress={() => {
                                        onSelectDate(d);
                                        onClose();
                                    }}
                                    className="w-10 h-10 mb-2 items-center justify-center rounded-full"
                                    style={{
                                        backgroundColor: selected ? '#b30f15' : 'transparent',
                                        borderWidth: today && !selected ? 1 : 0,
                                        borderColor: '#52525b',
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-sm font-bold ${selected ? 'text-white' : 'text-zinc-300'
                                            }`}
                                    >
                                        {d.getDate()}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                </View>
            </View>
        </Modal>
    );
}
