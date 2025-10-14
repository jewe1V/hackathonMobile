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
import AsyncStorage from '@react-native-async-storage/async-storage';

// Глобальное хранилище токена
class AuthTokenManager {
    private static token: string | null = null;
    private static tokenExpiryTimer: NodeJS.Timeout | null = null;
    private static tokenListeners: ((token: string | null) => void)[] = [];

    static async initialize() {
        // Восстанавливаем токен из AsyncStorage при запуске
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
            const tokenExpiry = await AsyncStorage.getItem('authTokenExpiry');

            if (storedToken && tokenExpiry) {
                const expiryTime = parseInt(tokenExpiry, 10);
                if (Date.now() < expiryTime) {
                    this.token = storedToken;
                    this.scheduleTokenCleanup(expiryTime - Date.now());
                } else {
                    // Токен просрочен, очищаем
                    await this.clearToken();
                }
            }
        } catch (error) {
            console.error('Error initializing auth token:', error);
        }
    }

    static getToken(): string | null {
        return this.token;
    }

    static async setToken(token: string, expiresInMs: number = 60 * 60 * 1000) { // 1 час по умолчанию
        this.token = token;

        const expiryTime = Date.now() + expiresInMs;

        // Сохраняем в AsyncStorage
        try {
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('authTokenExpiry', expiryTime.toString());
        } catch (error) {
            console.error('Error saving auth token:', error);
        }

        // Планируем очистку токена
        this.scheduleTokenCleanup(expiresInMs);

        // Уведомляем слушателей
        this.notifyListeners();
    }

    static async clearToken() {
        this.token = null;

        // Очищаем таймер
        if (this.tokenExpiryTimer) {
            clearTimeout(this.tokenExpiryTimer);
            this.tokenExpiryTimer = null;
        }

        // Удаляем из AsyncStorage
        try {
            await AsyncStorage.multiRemove(['authToken', 'authTokenExpiry']);
        } catch (error) {
            console.error('Error clearing auth token:', error);
        }

        // Уведомляем слушателей
        this.notifyListeners();
    }

    private static scheduleTokenCleanup(expiresInMs: number) {
        // Очищаем предыдущий таймер
        if (this.tokenExpiryTimer) {
            clearTimeout(this.tokenExpiryTimer);
        }

        // Устанавливаем новый таймер
        // @ts-ignore
        this.tokenExpiryTimer = setTimeout(() => {
            this.clearToken();
            console.log('Token automatically cleared after 1 hour');
        }, expiresInMs);
    }

    static addListener(listener: (token: string | null) => void) {
        this.tokenListeners.push(listener);

        // Возвращаем функцию для удаления слушателя
        return () => {
            this.tokenListeners = this.tokenListeners.filter(l => l !== listener);
        };
    }

    private static notifyListeners() {
        this.tokenListeners.forEach(listener => {
            try {
                listener(this.token);
            } catch (error) {
                console.error('Error in token listener:', error);
            }
        });
    }

    static isTokenValid(): boolean {
        return this.token !== null;
    }
}

// Инициализируем менеджер при загрузке модуля
AuthTokenManager.initialize();

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
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://boardly.ru/api/Auth/login', {
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

            // Сохраняем токен в глобальное хранилище (автоматически очистится через час)
            await AuthTokenManager.setToken(data.token);

            // Сохраняем данные пользователя в AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify(data.user));

            console.log('Успешная авторизация, токен сохранен в глобальное хранилище');
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
export { AuthTokenManager };
