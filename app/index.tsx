import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts as usePlayfair, PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { View, FlatList, Modal, ActivityIndicator, StatusBar, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { ModalScreen } from "@/components/ModalScreen";
import { Post } from "@/models/Event";
import { usePosts } from "@/components/NewsScreen/hooks/usePorts";
import { EmptyState } from "@/components/NewsScreen/components/EmptyState";
import { ErrorState } from "@/components/NewsScreen/components/ErrorState";
import { LoadingScreen } from "@/components/NewsScreen/components/LoadingScreen";
import { styles } from "@/components/NewsScreen/components/styles";

export const NewsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { posts, loading, error, refreshing, hasMore, fetchMore, refresh } = usePosts();
    const [modalPost, setModalPost] = useState<Post | null>(null);
    const firstLoad = useRef(true);

    const params = useLocalSearchParams();

    useFocusEffect(
        React.useCallback(() => {
            if (firstLoad.current && !loading && !refreshing) {
                firstLoad.current = false;
                refresh();
            }
        }, [refresh, loading, refreshing])
    );

    useEffect(() => {
        if (params.refresh === "true") {
            refresh();
        }
    }, [params.refresh]);

    const handlePostDelete = (postId: string) => {
        setModalPost(null);
        refresh();
    };

    if (loading && posts.length === 0) return <LoadingScreen />;
    if (error && posts.length === 0) return <ErrorState onRetry={refresh} />;
    if (!loading && posts.length === 0) return <EmptyState onRetry={refresh} />;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
            <Header title="Новости" />

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostCard post={item} onOpen={setModalPost} />
                )}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
                onEndReached={hasMore ? fetchMore : undefined}
                onEndReachedThreshold={0.4}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor="#0a58ff"
                        colors={["#0a58ff"]}
                    />
                }
                ListFooterComponent={
                    loading && posts.length > 0 ? (
                        <ActivityIndicator style={{ marginVertical: 16 }} color="#0a58ff" />
                    ) : null
                }
            />

            <Modal visible={!!modalPost} animationType="slide" onRequestClose={() => setModalPost(null)}>
                <ModalScreen
                    modalPost={modalPost}
                    onClose={() => setModalPost(null)}
                    onPostDelete={handlePostDelete}
                />
            </Modal>
        </View>
    );
};

const App: React.FC = () => {
    const [playfairLoaded] = usePlayfair({
        PlayfairDisplay_700Bold,
        PlayfairDisplay_600SemiBold,
    });

    const [interLoaded] = useInterFonts({
        Inter_400Regular,
        Inter_600SemiBold,
    });

    const fontsLoaded = playfairLoaded && interLoaded;


    return (
        <SafeAreaProvider>
            <NewsScreen />
        </SafeAreaProvider>
    );
};

export default App;
