import { useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, useWindowDimensions, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export interface WeekCalendarProps extends ViewProps {
    title?: string;
    date: Date;
    onChange: (date: Date) => void;
    showTodayDot?: boolean;
}

export function WeekCalendar({
    title = 'Calendário',
    date,
    onChange,
    showTodayDot = true,
    className = "mb-6",
    ...rest
}: WeekCalendarProps) {
    const { width } = useWindowDimensions();
    const calendarRef = useRef<FlatList>(null);

    // The calendar shows exactly 7 days without gap for the container calculation.
    const dayItemWidth = (width - 40) / 7;
    const monthName = date.toLocaleString('pt-BR', { month: 'long' });

    // Scroll to the start of the current week when calendar mounts
    useEffect(() => {
        setTimeout(() => {
            const currentWeekIndex = Math.floor(TODAY_INDEX / 7) * 7;
            calendarRef.current?.scrollToIndex({ index: currentWeekIndex, animated: false, viewPosition: 0 });
        }, 100);
    }, []);

    return (
        <View className={className} {...rest}>
            <View className="flex-row items-center justify-between mb-4">
                <Text className="font-bold text-lg text-white">{title}</Text>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="chevron-back" size={14} color="#71717a" />
                    <Text className="text-zinc-300 text-sm font-medium capitalize">{monthName}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#71717a" />
                </View>
            </View>

            <FlatList
                ref={calendarRef}
                data={ALL_DAYS}
                keyExtractor={(item) => item.date.toDateString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={width - 40}
                snapToAlignment="start"
                decelerationRate="fast"
                initialScrollIndex={Math.floor(TODAY_INDEX / 7) * 7}
                contentContainerStyle={{ paddingHorizontal: 0 }}
                getItemLayout={(_, index) => ({
                    length: dayItemWidth,
                    offset: dayItemWidth * index,
                    index,
                })}
                onScrollToIndexFailed={({ index }) => {
                    setTimeout(() => {
                        calendarRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
                    }, 200);
                }}
                renderItem={({ item }) => {
                    const isSelected = isSameDay(item.date, date);

                    return (
                        <TouchableOpacity
                            onPress={() => onChange(item.date)}
                            activeOpacity={0.8}
                            style={{
                                width: dayItemWidth,
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
                                {showTodayDot && item.isToday && (
                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : '#b30f15', marginTop: 4, position: 'absolute', bottom: 6, zIndex: 1 }} />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}
