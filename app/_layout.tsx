import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { AuthTokenManager } from '@/components/LoginScreen';

export default () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Проверяем токен при монтировании
        const token = AuthTokenManager.getToken();
        setIsAuthenticated(!!token);

        // Подписываемся на изменения токена
        const unsubscribe = AuthTokenManager.addListener((token) => {
            setIsAuthenticated(!!token);
        });

        return unsubscribe;
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#1e90ff",
                tabBarInactiveTintColor: "gray",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="newspaper-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(screens)/EventsScreen"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(screens)/ProfileScreen"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                    // Полностью скрываем таб если не авторизован
                    href: isAuthenticated ? "(screens)/ProfileScreen" : null,
                }}
            />
            <Tabs.Screen
                name="(screens)/CatalogScreen"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-attach-outline" size={size} color={color} />
                    ),
                    // Полностью скрываем таб если не авторизован
                    href: isAuthenticated ? "(screens)/CatalogScreen" : null,
                }}
            />
            <Tabs.Screen
                name="(screens)/MenuScreen"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="briefcase-outline" size={size} color={color} />
                    ),
                    // Полностью скрываем таб если не авторизован
                    href: isAuthenticated ? "(screens)/MenuScreen" : null,
                }}
            />
            <Tabs.Screen
                name="(screens)/CreatePostScreen"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="briefcase-outline" size={size} color={color} />
                    ),
                    // Полностью скрываем таб если не авторизован
                    href : null,
                }}
            />
            <Tabs.Screen
                name="(screens)/CreateEventScreen"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-attach-outline" size={size} color={color} />
                    ),
                    // Полностью скрываем таб если не авторизован
                    href : null,
                }}
            />
        </Tabs>
    );
};
