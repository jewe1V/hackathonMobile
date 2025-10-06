import { Post } from '@/models/Event';
import { POSTS } from '@/api/mockData';
import { PostCard } from '@/components/PostCard';
import { Header } from '@/components/Header';
import { ModalScreen } from "@/components/ModalScreen";
import {
    useFonts as usePlayfair,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Modal,
    StatusBar,
    ActivityIndicator,
    Share,
    Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { ViewToken } from 'react-native';

// Типы для пропсов компонентов
interface LoadingScreenProps {}

// Компонент для экрана загрузки с безопасными областями
const LoadingScreen: React.FC<LoadingScreenProps> = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.loading, { paddingTop: insets.top }]}>
            <ActivityIndicator size="large" color="#0a58ff" />
        </View>
    );
};

// Основной компонент приложения
const AppContent: React.FC = () => {
    // fonts
    const [pfLoaded] = usePlayfair({ PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold });
    const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_600SemiBold });
    const fontsLoaded = pfLoaded && interLoaded;

    const [posts, setPosts] = useState<Post[]>(POSTS);
    const [modalPost, setModalPost] = useState<Post | null>(null);
    const [viewable, setViewable] = useState<Record<string, boolean>>({});

    const insets = useSafeAreaInsets();


    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 40 });
    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        // mark viewable item ids true
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
        // add mock more
        setTimeout(() => {
            setPosts((prev) => {
                const more = prev.slice(0, 3).map((p, idx) => ({
                    ...p,
                    id: `more-${Date.now()}-${idx}`
                }));
                return [...prev, ...more];
            });
        }, 800);
    }, []);

    if (!fontsLoaded) {
        return <LoadingScreen />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
            <Header title={"Новости"}/>

            {/* List */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
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
            />

            {/* Modal */}
            <Modal visible={!!modalPost} animationType="slide" onRequestClose={() => setModalPost(null)}>
                <ModalScreen
                    modalPost={modalPost}
                    onClose={() => setModalPost(null)}
                    onShare={onShare}
                />
            </Modal>
        </View>
    );
}

const App: React.FC = () => {
    return (
        <SafeAreaProvider>
            <AppContent />
        </SafeAreaProvider>
    );
}

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
    bottomNav: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 66,
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    navItem: {
        alignItems: 'center'
    },
    navText: {
        fontSize: 13,
        color: '#6b7280',
        fontFamily: 'Inter_400Regular'
    },
    navActive: {
        color: '#0a58ff',
        fontFamily: 'Inter_600SemiBold'
    },

    /* modal */
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff'
    },
    modalHeader: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalClose: {
        fontSize: 22,
        color: '#0a58ff'
    },
    modalShare: {
        fontSize: 20,
        color: '#0a58ff'
    },
    modalImage: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        marginBottom: 16
    },
    modalCate: {
        fontSize: 13,
        color: '#0a58ff',
        marginBottom: 8,
        fontFamily: 'Inter_600SemiBold'
    },
    modalTitle: {
        fontSize: 22,
        marginBottom: 8,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#0b2140'
    },
    modalDate: {
        fontSize: 12,
        color: '#7b8794',
        marginBottom: 12,
        fontFamily: 'Inter_400Regular'
    },
    modalBody: {
        fontSize: 16,
        color: '#344054',
        lineHeight: 22,
        fontFamily: 'Inter_400Regular'
    },
});

export default App;
