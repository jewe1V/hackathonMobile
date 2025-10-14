import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from "@/components/Header";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Profile } from '@/models/ProfileModel';
import { Post } from '@/models/Event';
import { AuthTokenManager } from '@/components/LoginScreen';
import { ModalScreen } from '@/components/ModalScreen'; // Импортируем ModalScreen
import {router} from "expo-router";

const API_URL = 'https://boardly.ru/api/Auth/current';

const ProfileScreen: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(AuthTokenManager.getToken());
    const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Для хранения выбранного поста
    const insets = useSafeAreaInsets();

    // Подписываемся на изменения токена
    useEffect(() => {
        const unsubscribe = AuthTokenManager.addListener((newToken) => {
            console.log('Token changed in ProfileScreen:', newToken);
            setToken(newToken);

            // Если токен удален, сбрасываем профиль
            if (!newToken) {
                setProfile(null);
                setLoading(false);
            } else {
                // Если появился новый токен, загружаем профиль
                loadProfile(newToken);
            }
        });

        return unsubscribe;
    }, []);

    // Загружаем профиль при первом монтировании
    useEffect(() => {
        if (token) {
            loadProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    const loadProfile = async (currentToken?: string) => {
        const authToken = currentToken || token;

        if (!authToken) {
            console.warn('Токен не найден');
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token invalid, clearing...');
                    await AuthTokenManager.clearToken();
                }
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
                createdAt: data.createdAt || new Date().toISOString(),
                userRoles: data.roles ? data.roles.map((r: string) => ({
                    role: { name: r }
                })) : [],
                posts: data.posts ?? [],
                documents: data.documents ?? [],
                eventsOrganized: data.events ?? []
            };

            setProfile(formattedProfile);
        } catch (error) {
            console.error('Ошибка загрузки профиля', error);
            setProfile(null);

            if (error instanceof TypeError) {
                console.log('Network error, but token might still be valid');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadProfile();
    };

    const handleLogout = async () => {
        await AuthTokenManager.clearToken();
        // Профиль автоматически очистится через слушатель
    };

    const handleOpenPost = (post: Post) => {
        setSelectedPost(post);
    };

    const handleClosePost = () => {
        setSelectedPost(null);
    };

    const handleSharePost = (post: Post) => {
        // Заглушка для функции "Поделиться"
        // Здесь можно добавить логику для шаринга, например, через Share API
        console.log('Sharing post:', post.title);
        Alert.alert('Поделиться', `Поделиться постом: ${post.title}`);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return 'Неверная дата';
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1760fd" />
                <Text style={styles.loadingText}>Загрузка профиля...</Text>
            </View>
        );
    }

    // Если пользователь не авторизован
    if (!token || !profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person-circle-outline" size={64} color="#6b7280" />
                <Text style={styles.unauthorizedTitle}>Доступ ограничен</Text>
                <Text style={styles.unauthorizedText}>Данные профиля доступны только авторизованным пользователям</Text>

                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.refreshButtonText}>Проверить авторизацию</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
                <Header
                    title="Профиль"
                    subTitle={profile.fullName}
                />

                {/* Основная информация */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Основная информация</Text>
                        <TouchableOpacity onPress={handleRefresh} style={styles.refreshIcon}>
                            <Ionicons name="refresh" size={20} color="#1760fd" />
                        </TouchableOpacity>
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

                    {profile.userRoles.length > 0 && (
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
                    )}

                    {profile.createdAt && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>В системе с:</Text>
                            <Text style={styles.infoValue}>{formatDate(profile.createdAt)}</Text>
                        </View>
                    )}
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
                            <TouchableOpacity
                                key={post.id}
                                style={styles.listItem}
                                onPress={() => handleOpenPost(post)}
                            >
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
                            <TouchableOpacity key={event.id} style={styles.listItem} onPress={() => router.push(`/(screens)/EventsScreen`)}>
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

            {/* Модальное окно для отображения ModalScreen */}
            <Modal
                visible={!!selectedPost}
                animationType="slide"
                transparent={false} // ModalScreen имеет собственный стиль контейнера
                onRequestClose={handleClosePost}
            >
                {selectedPost && (
                    <ModalScreen
                        modalPost={selectedPost}
                        onClose={handleClosePost}
                        onShare={handleSharePost}
                    />
                )}
            </Modal>
        </View>
    );
};

// Стили
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6b7280',
        fontFamily: 'Inter_400Regular',
    },
    unauthorizedTitle: {
        fontSize: 20,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#0b2340',
        marginTop: 12,
        marginBottom: 8,
    },
    unauthorizedText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Inter_400Regular',
        paddingHorizontal: 20,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1760fd',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        marginLeft: 8,
    },
    logoutButton: {
        padding: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#0b2340',
    },
    refreshIcon: {
        padding: 4,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#6b7280',
        width: 100,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#0b2340',
        flex: 1,
    },
    rolesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
    },
    roleBadge: {
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    roleText: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#0b2340',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    statNumber: {
        fontSize: 18,
        fontFamily: 'Inter_400Regular',
        color: '#0b2340',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#6b7280',
        marginTop: 4,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    listItemContent: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#0b2340',
        marginBottom: 4,
    },
    listItemDate: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#6b7280',
    },
    eventIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#175ffb',
        marginRight: 12,
    },
});

export default ProfileScreen;
