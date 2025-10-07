import React, { useState } from 'react';
import {
    Image,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Типы для ответа сервера
interface User {
    id: string;
    email: string;
    jobTitle: string;
    passwordHash: string;
    salt: string;
    fullName: string;
    createdAt: string;
    userRoles: any[];
    posts: any[];
    documents: any[];
    eventsOrganized: any[];
}

interface AuthResponse {
    token: string;
    user: User;
}

interface LoginModalScreenProps {
    visible: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginModalScreenProps> = ({
                                                          visible,
                                                          onClose,
                                                          onLoginSuccess
                                                      }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<any>();

    const [fontsLoaded] = useFonts({
        PlayfairDisplay_700Bold,
        Inter_400Regular,
        Inter_600SemiBold,
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://localhost:7112/api/Auth/login', {
                method: 'POST',
                headers: {
                    'accept': 'text/plain',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }

            const data: AuthResponse = await response.json();

            // Сохраняем токен и данные пользователя в AsyncStorage
            await AsyncStorage.setItem('authToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(data.user));

            console.log('Успешная авторизация, токен сохранен');
            onLoginSuccess();
            onClose();

        } catch (error) {
            console.error('Ошибка авторизации:', error);
            Alert.alert('Ошибка', 'Не удалось войти. Проверьте логин и пароль');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = () => {
        onClose();
        navigation.navigate('MainTabs');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <Image
                        style={styles.emblem}
                        resizeMode="contain"
                        source={require('@/assets/images/ekb-emblem.png')}
                    />
                    <Text style={styles.title}>Цифровой кабинет депутата</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />
                    <TextInput
                        placeholder="Пароль"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        autoComplete="password"
                    />

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Войти</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
    },
    emblem: {
        width: 80,
        height: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    form: {
        paddingHorizontal: 24,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        marginBottom: 16,
        color: '#1F2937',
    },
    loginButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
    guestButton: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    guestButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
});

export default LoginScreen;
