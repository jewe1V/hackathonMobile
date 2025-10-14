import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Header} from "@/components/Header";
import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

const MenuScreen = () => {
    return (
        <View style={styles.menuContainer}>
            <Header title={'Выберите действие'} isUserButton={false}/>
            <View style={styles.postCardContainer}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => router.push('/(screens)/CreateEventScreen')}
                >
                    <Ionicons name="calendar-outline" size={22} color="#0a57fd" />
                    <Text style={styles.menuButtonText}>Планирование</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, { backgroundColor: '#0a57fd' }]}
                    onPress={() => router.push('/(screens)/CreatePostScreen')}
                >
                    <Ionicons name="create-outline" size={22} color="#fff" />
                    <Text style={[styles.menuButtonText, {color: '#fff'}]}>Публикация</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    // --- Главное меню ---
    menuContainer: {
        flex: 1,
        backgroundColor: '#f1f2f4',
        padding: 24,
    },
    postCardContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    menuTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 30,
        color: '#333',
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: '#fff',
        borderColor: '#0a56fb',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginVertical: 10,
        width: '100%',
        justifyContent: 'center',
    },
    menuButtonText: {
        color: '#0a56fb',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
})

export default MenuScreen;
