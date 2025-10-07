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
} from 'react-native';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { ViewToken } from 'react-native';

const API_URL = 'https://localhost:7112/api/Posts';
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

    const fetchPosts = useCallback(async (offset: number) => {
        if (loading || !hasMore) return;

        setLoading(true);
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
            if (data.length === 0) {
                setHasMore(false);
            } else {
                setPosts((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const filtered = data.filter((p) => !existingIds.has(p.id));
                    return [...prev, ...filtered];
                });
                setSkip(offset + PAGE_SIZE);
            }
        } catch (err: any) {
            console.error(err);
            Alert.alert('Ошибка', 'Не удалось загрузить новости');
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore]);

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
        if (hasMore && !loading) {
            fetchPosts(skip);
        }
    }, [fetchPosts, skip, hasMore, loading]);

    useEffect(() => {
        fetchPosts(0);
    }, [fetchPosts]);

    if (!fontsLoaded) {
        return <LoadingScreen />;
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
});

export default App;
