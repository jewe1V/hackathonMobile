import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from "@/components/Header";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/models/ProfileModel';

const API_URL = 'https://localhost:7112/api/Auth/current';

const ProfileScreen: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    const loadProfile = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.warn('Токен не найден');
                setProfile(null);
                setLoading(false);
                return;
            }

            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Ошибка при загрузке профиля', response.status);
                setProfile(null);
                return;
            }

            const data = await response.json();

            // Преобразуем данные с API в структуру Profile
            const formattedProfile: Profile = {
                id: data.id,
                email: data.email,
                fullName: data.fullName,
                jobTitle: data.jobTitle,
                createdAt: new Date().toISOString(), // если в API нет поля
                userRoles: data.roles.map((r: string) => ({
                    role: { name: r }
                })),
                posts: data.posts ?? [],
                documents: data.documents ?? [],
                eventsOrganized: data.events ?? []
            };

            setProfile(formattedProfile);
        } catch (error) {
            console.error('Ошибка загрузки профиля', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1760fd" />
            </View>
        );
    }

    // Если пользователь не авторизован или загрузка профиля не удалась
    if (!profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 16, color: '#0b2340', marginBottom: 16 }}>Данные доступны только авторизованному пользователю</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={loadProfile}>
                    <Text style={styles.refreshButtonText}>Обновить</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <Header title="Профиль" subTitle={profile.fullName} />

            {/* Основная информация */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Основная информация</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ФИО:</Text>
                    <Text style={styles.infoValue}>{profile.fullName}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Должность:</Text>
                    <Text style={styles.infoValue}>{profile.jobTitle}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{profile.email}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Роли:</Text>
                    <View style={styles.rolesContainer}>
                        {profile.userRoles.map((userRole, index) => (
                            <View key={index} style={styles.roleBadge}>
                                <Text style={styles.roleText}>{userRole.role.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Статистика */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Ionicons name="document-text" size={32} color="#1760fd" />
                    <Text style={styles.statNumber}>{profile.posts.length}</Text>
                    <Text style={styles.statLabel}>Публикаций</Text>
                </View>

                <View style={styles.statCard}>
                    <Ionicons name="folder" size={32} color="#1760fd" />
                    <Text style={styles.statNumber}>{profile.documents.length}</Text>
                    <Text style={styles.statLabel}>Документов</Text>
                </View>

                <View style={styles.statCard}>
                    <Ionicons name="calendar" size={32} color="#1760fd" />
                    <Text style={styles.statNumber}>{profile.eventsOrganized.length}</Text>
                    <Text style={styles.statLabel}>Мероприятий</Text>
                </View>
            </View>

            {/* Последние публикации */}
            {profile.posts.length > 0 && (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Последние публикации</Text>
                    </View>
                    {profile.posts.slice(0, 3).map((post) => (
                        <TouchableOpacity key={post.id} style={styles.listItem}>
                            <View style={styles.listItemContent}>
                                <Text style={styles.listItemTitle} numberOfLines={2}>{post.title}</Text>
                                <Text style={styles.listItemDate}>{formatDate(post.createdAt)}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Предстоящие мероприятия */}
            {profile.eventsOrganized.length > 0 && (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Предстоящие мероприятия</Text>
                    </View>
                    {profile.eventsOrganized.slice(0, 3).map((event) => (
                        <TouchableOpacity key={event.id} style={styles.listItem}>
                            <View style={styles.eventIndicator} />
                            <View style={styles.listItemContent}>
                                <Text style={styles.listItemTitle} numberOfLines={2}>{event.title}</Text>
                                <Text style={styles.listItemDate}>{formatDate(event.startAt)}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#175ffb" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e1f22',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6b7280',
        flex: 1,
    },
    infoValue: {
        fontSize: 12,
        color: '#0b2340',
        flex: 2,
        textAlign: 'right',
    },
    rolesContainer: {
        flex: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 6,
    },
    roleBadge: {
        backgroundColor: '#175ffb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 10,
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    statNumber: {
        fontSize: 18,
        color: '#0b2340',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        paddingBottom: 5
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    listItemContent: {
        flex: 1,
        marginHorizontal: 12,
    },
    listItemTitle: {
        fontSize: 14,
        color: '#0b2340',
        marginBottom: 4,
    },
    listItemDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    eventIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#1760fd',
    },
    refreshButton: {
        backgroundColor: '#1760fd',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ProfileScreen;
