import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthTokenManager } from '@/components/LoginScreen';

export default function CreateEventScreen() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [startAt, setStartAt] = useState<Date | null>(null);
    const [endAt, setEndAt] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const insets = useSafeAreaInsets();
    const titleInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    const locationInputRef = useRef<TextInput>(null);

    const handleCreate = async () => {
        if (!title.trim() || !startAt || !endAt) {
            Alert.alert("Ошибка", "Пожалуйста, заполните обязательные поля");
            return;
        }

        if (endAt <= startAt) {
            Alert.alert("Ошибка", "Дата окончания должна быть позже даты начала");
            return;
        }

        const token = AuthTokenManager.getToken();
        if (!token) {
            Alert.alert("Ошибка", "Для создания события необходимо авторизоваться");
            return;
        }

        setIsLoading(true);

        try {
            const eventData = {
                title: title.trim(),
                description: description.trim(),
                startAt: startAt.toISOString(),
                endAt: endAt.toISOString(),
                location: location.trim(),
                isPublic: true,
            };

            console.log('Отправка данных:', eventData);

            const response = await fetch('https://boardly.ru/api/Events', {
                method: 'POST',
                headers: {
                    'accept': 'text/plain',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка сервера:', response.status, errorText);

                if (response.status === 401) {
                    throw new Error('Недостаточно прав для создания события');
                } else if (response.status === 400) {
                    throw new Error('Неверные данные события');
                } else {
                    throw new Error(`Ошибка сервера: ${response.status}`);
                }
            }

            const createdEvent = await response.json();
            console.log('Событие создано:', createdEvent);

            Alert.alert(
                "Успех",
                "Событие успешно создано!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.push('/(screens)/EventsScreen');
                        },
                    },
                ],
            );
        } catch (error: any) {
            console.error('Ошибка при создании события:', error);
            Alert.alert(
                "Ошибка",
                error.message || "Не удалось создать событие. Проверьте подключение к интернету.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartAt(selectedDate);
            if (!endAt || endAt <= selectedDate) {
                const newEndDate = new Date(selectedDate);
                newEndDate.setHours(newEndDate.getHours() + 2);
                setEndAt(newEndDate);
            }
        }
        Keyboard.dismiss(); // Закрываем клавиатуру при выборе даты
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEndAt(selectedDate);
        }
        Keyboard.dismiss(); // Закрываем клавиатуру при выборе даты
    };

    const formatDateForDisplay = (date: Date | null): string => {
        if (!date) return '';
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Улучшенное смещение для iOS
        >
            <ScrollView
                contentContainerStyle={[styles.container, { paddingTop: insets.top + 10 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled" // Позволяет тапать по элементам при открытой клавиатуре
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.push('/(screens)/MenuScreen')}
                        style={styles.backButton}
                        disabled={isLoading}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Запланировать событие</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Название *</Text>
                    <TextInput
                        ref={titleInputRef}
                        style={styles.input}
                        placeholder="Введите название"
                        value={title}
                        onChangeText={setTitle}
                        editable={!isLoading}
                        returnKeyType="next"
                        onSubmitEditing={() => descriptionInputRef.current?.focus()}
                    />

                    <Text style={styles.label}>Описание</Text>
                    <TextInput
                        ref={descriptionInputRef}
                        style={[styles.input, styles.textArea]}
                        placeholder="Введите описание"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                        editable={!isLoading}
                        returnKeyType="next"
                        onSubmitEditing={() => locationInputRef.current?.focus()}
                    />

                    <Text style={styles.label}>Место проведения</Text>
                    <TextInput
                        ref={locationInputRef}
                        style={styles.input}
                        placeholder="Введите место проведения"
                        value={location}
                        onChangeText={setLocation}
                        editable={!isLoading}
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                    />

                    <Text style={styles.label}>Дата и время начала *</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => {
                            setShowStartPicker(!showStartPicker);
                            Keyboard.dismiss(); // Закрываем клавиатуру при открытии DateTimePicker
                        }}
                        disabled={isLoading}
                    >
                        <Text style={startAt ? styles.dateText : styles.placeholderText}>
                            {startAt ? formatDateForDisplay(startAt) : 'Выберите дату и время начала'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    {showStartPicker && (
                        <View style={styles.datePickerContainer}>
                            <DateTimePicker
                                value={startAt || new Date()}
                                mode="datetime"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={onStartDateChange}
                                minimumDate={new Date()}
                                style={styles.datePicker}
                            />
                        </View>
                    )}

                    <Text style={styles.label}>Дата и время окончания *</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => {
                            setShowEndPicker(!showEndPicker);
                            Keyboard.dismiss(); // Закрываем клавиатуру при открытии DateTimePicker
                        }}
                        disabled={isLoading}
                    >
                        <Text style={endAt ? styles.dateText : styles.placeholderText}>
                            {endAt ? formatDateForDisplay(endAt) : 'Выберите дату и время окончания'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    {showEndPicker && (
                        <View style={styles.datePickerContainer}>
                            <DateTimePicker
                                value={endAt || new Date()}
                                mode="datetime"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={onEndDateChange}
                                minimumDate={startAt || new Date()}
                                style={styles.datePicker}
                            />
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.publishButton,
                        isLoading && styles.publishButtonDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="add-circle-outline" size={22} color="#fff" />
                    )}
                    <Text style={styles.publishButtonText}>
                        {isLoading ? "Создание..." : "Создать событие"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#f8fafc",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        paddingVertical: 12,
    },
    backButton: {
        marginRight: 10,
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        color: "#555",
        marginBottom: 6,
        marginTop: 12,
        fontWeight: '600',
    },
    input: {
        backgroundColor: "#f7f7f7",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        marginBottom: 14,
    },
    textArea: {
        height: 200,
        textAlignVertical: 'top',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "#f7f7f7",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 14,
    },
    dateText: {
        fontSize: 15,
        color: '#333',
    },
    placeholderText: {
        fontSize: 15,
        color: '#9ca3af',
    },
    datePickerContainer: {
        backgroundColor: "#f7f7f7",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        marginBottom: 14,
        overflow: 'hidden',
    },
    datePicker: {
        width: '100%',
    },
    publishButton: {
        backgroundColor: "#0a57fd",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 16,
    },
    publishButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    publishButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
});
