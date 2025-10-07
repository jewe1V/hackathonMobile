import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from '@/components/Calendar';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/models/Event';
import { Header } from "@/components/Header";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EventsScreen: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string | undefined>();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const loadEvents = async (year: number, month: number) => {
        try {
            setLoading(true);
            const from = new Date(year, month, 1).toISOString();
            const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

            const response = await fetch(
                `https://localhost:7112/api/Events/upcoming?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
                {
                    headers: {
                        Accept: 'text/plain',
                    }
                }
            );

            if (!response.ok) throw new Error('Ошибка загрузки событий');
            const data: Event[] = await response.json();
            setEvents(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Подгружаем события за текущий месяц при первом рендере
    useEffect(() => {
        const now = new Date();
        loadEvents(now.getFullYear(), now.getMonth());
    }, []);

    const filteredEvents = useMemo(() => {
        if (selectedDate) {
            return events.filter(ev => ev.startAt.split('T')[0] === selectedDate);
        }
        const now = new Date();
        return events.filter(ev => new Date(ev.startAt) >= now);
    }, [events, selectedDate]);

    const grouped = useMemo(() => {
        const map: Record<string, Event[]> = {};
        filteredEvents.forEach(event => {
            const dateKey = event.startAt.split('T')[0];
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(event);
        });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredEvents]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Предстоящие события" />
            <Calendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={events}
                onMonthChange={loadEvents} // 👈 загрузка при смене месяца
            />

            {loading ? (
                <ActivityIndicator size="large" color="#0a58ff" style={{ marginTop: 20 }} />
            ) : grouped.length === 0 ? (
                <Text style={styles.emptyText}>
                    {selectedDate
                        ? 'На выбранную дату пока ничего не запланировано.'
                        : 'В этом месяце пока ничего не запланировано.'}
                </Text>
            ) : (
                <FlatList
                    data={grouped}
                    keyExtractor={([date]) => date}
                    renderItem={({ item }) => {
                        const [date, dayEvents] = item;
                        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        });
                        return (
                            <View style={styles.groupBlock}>
                                <View style={styles.dateBadge}>
                                    <Text style={styles.dateBadgeText}>{formattedDate}</Text>
                                </View>
                                {dayEvents.map(ev => (
                                    <EventCard key={ev.id} event={ev} />
                                ))}
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 16,
    },
    emptyText: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 20,
    },
    groupBlock: {
        marginBottom: 20,
    },
    dateBadge: {
        backgroundColor: '#e6ecff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    dateBadgeText: {
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        color: '#0a58ff',
        textTransform: 'capitalize',
    },
    listContent: {
        paddingBottom: 32,
    },
});

export default EventsScreen;
