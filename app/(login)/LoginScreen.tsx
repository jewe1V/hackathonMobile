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
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<any>();

    const [fontsLoaded] = useFonts({
        PlayfairDisplay_700Bold,
        Inter_400Regular,
        Inter_600SemiBold,
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const handleLogin = () => {
        console.log('Login:', login, 'Password:', password);
        navigation.navigate('MainTabs');
    };

    const handleGuestLogin = () => {
        navigation.navigate('MainTabs');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <Image
                    style={styles.emblem}
                    resizeMode="contain"
                    source={require('../../assets/images/ekb-emblem.png')}
                />
                <Text style={styles.title}>Цифровой кабинет депутата</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    placeholder="Логин"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={login}
                    onChangeText={setLogin}
                />
                <TextInput
                    placeholder="Пароль"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Войти</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
                    <Text style={styles.guestButtonText}>Гостевой вход</Text>
                </TouchableOpacity>
            </View>


        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
        flexDirection: 'row',
    },
    emblem: {
        height: 70,
        width: 90,
        marginBottom: 16,
    },
    title: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 26,
        color: '#1E3A8A',
        textAlign: 'center',
        lineHeight: 28,
    },
    form: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: '#111827',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loginButton: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
    },
    guestButton: {
        marginTop: 20,
    },
    guestButtonText: {
        color: '#1E3A8A',
        textAlign: 'center',
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default LoginScreen;
