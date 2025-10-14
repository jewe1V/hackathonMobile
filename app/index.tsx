import { Post } from '@/models/Event';
import { PostCard } from '@/components/PostCard';
import { Header } from '@/components/Header';
import { ModalScreen } from "@/components/ModalScreen";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import {
    useFonts as usePlayfair,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Modal,
    StatusBar,
    ActivityIndicator,
    Share,
    Platform,
    Alert,
    Text,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { ViewToken } from 'react-native';

const API_URL = 'https://boardly.ru/api/Posts';
const PAGE_SIZE = 20;

interface LoadingScreenProps {}

const LoadingScreen: React.FC<LoadingScreenProps> = () => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.loading, { paddingTop: insets.top }]}>
            <ActivityIndicator size="large" color="#0a58ff" />
        </View>
    );
};

interface EmptyStateProps {
    onRetry?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRetry }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 100 }]}>
            <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>📰</Text>
            </View>
            <Text style={styles.emptyTitle}>Пока нет новостей</Text>
            <Text style={styles.emptySubtitle}>
                Новости появятся здесь немного позже
            </Text>
            {onRetry && (
                <View style={styles.retryButton} onTouchEnd={onRetry}>
                    <Text style={styles.retryButtonText}>Обновить</Text>
                </View>
            )}
        </View>
    );
};

interface ErrorStateProps {
    onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 100 }]}>
            <Text style={styles.emptyTitle}>Не удалось загрузить новости</Text>
            <Text style={styles.emptySubtitle}>
                Проверьте подключение к интернету и попробуйте еще раз
            </Text>
            <View style={styles.retryButton} onTouchEnd={onRetry}>
                <Text style={styles.retryButtonText}>Попробовать снова</Text>
            </View>
        </View>
    );
};

const AppContent: React.FC = () => {
    const [pfLoaded] = usePlayfair({ PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold });
    const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_600SemiBold });
    const fontsLoaded = pfLoaded && interLoaded;

    const [posts, setPosts] = useState<Post[]>([]);
    const [modalPost, setModalPost] = useState<Post | null>(null);
    const [viewable, setViewable] = useState<Record<string, boolean>>({});
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const insets = useSafeAreaInsets();

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 40 });
    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        setViewable((prev) => {
            const copy = { ...prev };
            viewableItems.forEach((v) => {
                if (v.item && v.item.id) {
                    copy[v.item.id] = true;
                }
            });
            return copy;
        });
    }).current;

    const handlePostDelete = (postId: string) => {
        // Обновляем состояние - удаляем пост из списка
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        // Можно также показать уведомление и т.д.
        console.log(`Post ${postId} deleted`);
    };

    const fetchPosts = useCallback(async (offset: number, isRetry: boolean = false) => {
        // Защита от повторных вызовов когда данных больше нет
        if ((loading && !isRetry) || (!isRetry && !hasMore && offset > 0)) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const TOKEN = await asyncStorage.getItem('authToken');
            const response = await fetch(`${API_URL}?skip=${offset}&take=${PAGE_SIZE}`, {
                headers: {
                    'accept': 'text/plain',
                    'Authorization': `Bearer ${TOKEN}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const data: Post[] = await response.json();

            // Если это первая загрузка и данных нет - показываем пустой экран
            if (data.length === 0) {
                setHasMore(false);
                // Если это первоначальная загрузка и нет данных - это нормально, не показываем ошибку
                if (offset === 0 && posts.length === 0) {
                    // Это нормальная ситуация - просто нет новостей
                    console.log('Новостей нет');
                }
            } else {
                setPosts((prev) => {
                    // При повторной попытке сбрасываем список
                    if (isRetry && offset === 0) {
                        return data;
                    }
                    const existingIds = new Set(prev.map((p) => p.id));
                    const filtered = data.reverse().filter((p) => !existingIds.has(p.id));
                    return [...prev, ...filtered];
                });
                setSkip(offset + data.length);
                // Если получили меньше чем запрашивали - значит больше данных нет
                if (data.length < PAGE_SIZE) {
                    setHasMore(false);
                }
            }
        } catch (err: any) {
            console.error('Ошибка загрузки:', err);
            setError('Не удалось загрузить новости');
            // Показываем Alert только если это не первоначальная загрузка
            if (!initialLoad || posts.length > 0) {
                Alert.alert('Ошибка', 'Не удалось загрузить новости');
            }
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, [loading, hasMore, initialLoad, posts.length]);

    const handleRetry = useCallback(() => {
        setError(null);
        setPosts([]);
        setSkip(0);
        setHasMore(true);
        setInitialLoad(true);
        fetchPosts(0, true);
    }, [fetchPosts]);

    const onShare = useCallback(async (post: Post) => {
        try {
            await Share.share({
                message: `${post.title}\n\n${post.summary}`,
                title: post.title,
                url: Platform.OS === 'ios' ? post.thumbnailUrl || undefined : undefined,
            });
        } catch (err) {
            console.warn(err);
        }
    }, []);

    const loadMore = useCallback(() => {
        if (hasMore && !loading && !error && skip > 0) {
            fetchPosts(skip);
        }
    }, [fetchPosts, skip, hasMore, loading, error]);

    // Используем useEffect только для первоначальной загрузки
    useEffect(() => {
        // Загружаем только если нет постов и не идет загрузка
        if (posts.length === 0 && !loading && !error) {
            fetchPosts(0);
        }
    }, []); // Пустой массив зависимостей - только при монтировании

    if (!fontsLoaded) {
        return <LoadingScreen />;
    }

    // Показываем экран ошибки если есть ошибка и нет постов
    if (error && posts.length === 0) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
                <Header title={"Новости"} />
                <ErrorState onRetry={handleRetry} />
            </View>
        );
    }

    // Показываем пустой экран если нет ошибки, нет постов и не идет загрузка
    if (!error && posts.length === 0 && !loading && !initialLoad) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
                <Header title={"Новости"} />
                <EmptyState onRetry={handleRetry} />
            </View>
        );
    }

    // Показываем загрузку при первоначальной загрузке
    if (initialLoad && posts.length === 0) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
                <Header title={"Новости"} />
                <LoadingScreen />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
            <Header title={"Новости"} />

            <FlatList
                data={posts}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={{
                    paddingBottom: 120,
                    paddingHorizontal: 2,
                    paddingTop: 8
                }}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onOpen={(p: Post) => setModalPost(p)}
                        animateIn={viewable[item.id]}
                    />
                )}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfigRef.current}
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator style={{ marginVertical: 16 }} color="#0a58ff" />
                    ) : null
                }
            />

            <Modal visible={!!modalPost} animationType="slide" onRequestClose={() => setModalPost(null)}>
                <ModalScreen
                    modalPost={modalPost}
                    onClose={() => setModalPost(null)}
                    onShare={onShare}
                    onPostDelete={handlePostDelete}
                />
            </Modal>
        </View>
    );
};

const App: React.FC = () => {
    return (
        <SafeAreaProvider>
            <AppContent />
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#f6f7fb'
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6f7fb'
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#f6f7fb'
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e8ecf8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyIconText: {
        fontSize: 32,
    },
    emptyTitle: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 12,
        color: '#1a1a1a',
        lineHeight: 32,
    },
    emptySubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 22,
        marginBottom: 32,
    },
    retryButton: {
        backgroundColor: '#0a58ff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 160,
        alignItems: 'center',
    },
    retryButtonText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: 'white',
    },
});

export default App;
