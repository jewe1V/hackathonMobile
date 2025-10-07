import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default () => {
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
                }}
            />
            <Tabs.Screen
                name="(screens)/CatalogScreen"
                options={{
                    tabBarLabel: "",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-attach-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};
