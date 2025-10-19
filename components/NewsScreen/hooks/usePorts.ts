import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Post } from "@/models/Event";
import { apiUrl } from "@/api/api";

const CACHE_KEY = "cached_posts";
const PAGE_SIZE = 20;

export const usePosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [isOffline, setIsOffline] = useState(false);

    // Подписываемся на статус сети
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOffline(!state.isConnected);
        });
        return unsubscribe;
    }, []);

    // Загружаем кэш при старте
    useEffect(() => {
        (async () => {
            try {
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setPosts(parsed);
                    console.log("📦 Загружены кэшированные посты");
                }
            } catch {
                console.warn("Ошибка чтения кэша постов");
            }
        })();
    }, []);

    const fetchPosts = useCallback(async (offset = 0, isRefresh = false) => {
        if (loading && !isRefresh) return;
        if (!hasMore && offset > 0) return;

        if (isRefresh) setRefreshing(true);
        setLoading(true);
        setError(null);

        try {
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) throw new Error("offline");

            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${apiUrl}/api/Posts?skip=${offset}&take=${PAGE_SIZE}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: Post[] = await res.json();

// 🔹 Сортируем посты от новых к старым по полю createdAt
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (isRefresh) {
                setPosts(sortedData);
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sortedData));
                setSkip(sortedData.length);
                setHasMore(sortedData.length === PAGE_SIZE);
            } else {
                setPosts((prev) => {
                    const newPosts = [...prev, ...sortedData.filter(p => !prev.some(old => old.id === p.id))];
                    // 🔹 Сортируем объединенный массив
                    const finalSortedPosts = newPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(finalSortedPosts));
                    return finalSortedPosts;
                });
                setSkip(offset + sortedData.length);
                if (sortedData.length < PAGE_SIZE) setHasMore(false);
            }

            setIsOffline(false);
        } catch (err: any) {
            console.warn("Ошибка загрузки постов:", err.message);
            if (err.message === "offline") {
                // показываем кэш
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setPosts(parsed);
                    setError("Вы офлайн. Показаны сохранённые новости.");
                    setIsOffline(true);
                } else {
                    setError("Нет подключения к интернету и отсутствуют сохранённые данные.");
                }
            } else {
                setError("Не удалось загрузить посты.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loading, hasMore]);

    const refresh = useCallback(async () => {
        setHasMore(true);
        setSkip(0);
        setError(null);
        await fetchPosts(0, true);
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        refreshing,
        hasMore,
        isOffline,
        fetchMore: () => fetchPosts(skip),
        refresh,
    };
};
