import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {Event} from "@/models/Event";

interface CalendarProps {
    selectedDate: string | undefined;
    onSelectDate: (date: string) => void;
    events: Event[];
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, events }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const months = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const daysArray = useMemo(() => {
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, [daysInMonth]);

    const eventsByDate = useMemo(() => {
        const map: Record<string, Event[]> = {};
        events.forEach((event) => {
            if (!map[event.date]) map[event.date] = [];
            map[event.date].push(event);
        });
        return map;
    }, [events]);

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={prevMonth}>
                    <Text style={styles.calendarNav}>←</Text>
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>{`${months[currentMonth]} ${currentYear}`}</Text>
                <TouchableOpacity onPress={nextMonth}>
                    <Text style={styles.calendarNav}>→</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <Text key={day} style={styles.calendarDay}>
                        {day}
                    </Text>
                ))}
                {Array(firstDay === 0 ? 6 : firstDay - 1)
                    .fill(null)
                    .map((_, idx) => (
                        <View key={`empty-${idx}`} style={styles.calendarEmpty} />
                    ))}
                {daysArray.map((day, index) => {
                    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day
                        .toString()
                        .padStart(2, '0')}`;
                    const hasEvents = !!eventsByDate[dateStr];
                    // Определяем, является ли день последним в строке
                    const isLastRow = index >= daysArray.length - 7;
                    return (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.calendarDate,
                                selectedDate === dateStr && styles.calendarDateSelected,
                                hasEvents && styles.calendarDateWithEvents,
                                isLastRow && styles.calendarDateLastRow, // Убираем marginBottom для последней строки
                            ]}
                            onPress={() => onSelectDate(dateStr)}
                        >
                            <Text
                                style={[
                                    styles.calendarDateText,
                                    selectedDate === dateStr && styles.calendarDateTextSelected,
                                ]}
                            >
                                {day}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    calendarTitle: {
        fontSize: 16,
        fontFamily: 'PlayfairDisplay_600SemiBold',
        color: '#0b2340',
    },
    calendarNav: {
        fontSize: 20,
        color: '#0a58ff',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: `${100 / 7}%`,
        textAlign: 'center',
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'Inter_400Regular',
        marginBottom: 8,
    },
    calendarDate: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    calendarDateLastRow: {
        marginBottom: 0, // Убираем отступ снизу для последней строки
    },
    calendarDateSelected: {
        backgroundColor: '#0a58ff',
        borderRadius: 8,
    },
    calendarDateWithEvents: {
        borderBottomWidth: 2,
        borderBottomColor: '#0a58ff',
    },
    calendarDateText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#0b2340',
    },
    calendarDateTextSelected: {
        color: '#fff',
        fontFamily: 'Inter_600SemiBold',
    },
    calendarEmpty: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
    },
});
