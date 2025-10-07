import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Animated,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {Header} from "@/components/Header";

// Тип данных каталога
export interface Catalog {
    id: string;
    name: string;
    parentCatalogId?: string;
    parentCatalog?: string;
    ownerId?: string;
    owner?: string;
    children?: string[];
    documents?: string[];
}

// ==== Основной экран ====
 const CatalogScreen: React.FC = () => {
    const insets = useSafeAreaInsets();

    const [catalogs, setCatalogs] = useState<Catalog[]>([
        {
            id: '1',
            name: 'Документы проекта',
            children: [],
            documents: [],
        },
        {
            id: '2',
            name: 'Договоры',
            children: [],
            documents: [],
        },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
    const [catalogName, setCatalogName] = useState('');

    const openCreateModal = () => {
        setEditingCatalog(null);
        setCatalogName('');
        setModalVisible(true);
    };

    const openEditModal = (catalog: Catalog) => {
        setEditingCatalog(catalog);
        setCatalogName(catalog.name);
        setModalVisible(true);
    };

    const saveCatalog = () => {
        if (catalogName.trim() === '') return;

        if (editingCatalog) {
            // Редактируем
            setCatalogs(prev =>
                prev.map(c =>
                    c.id === editingCatalog.id ? { ...c, name: catalogName } : c
                )
            );
        } else {
            // Создаём
            const newCatalog: Catalog = {
                id: Math.random().toString(36).substring(2),
                name: catalogName,
                children: [],
                documents: [],
            };
            setCatalogs(prev => [...prev, newCatalog]);
        }

        setModalVisible(false);
    };

    const deleteCatalog = (catalog: Catalog) => {
        Alert.alert(
            'Удаление каталога',
            `Вы действительно хотите удалить каталог "${catalog.name}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () =>
                        setCatalogs(prev => prev.filter(c => c.id !== catalog.id)),
                },
            ]
        );
    };

    const openCatalog = (catalog: Catalog) => {
        Alert.alert('Открыть каталог', `Тут будет список документов для: ${catalog.name}`);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Header title={'Каталоги документов'} isUserButton={false}/>
                <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={catalogs}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <CatalogItem
                        item={item}
                        index={index}
                        onEdit={openEditModal}
                        onDelete={deleteCatalog}
                        onOpen={openCatalog}
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Каталогов пока нет</Text>
                }
            />

            {/* Модальное окно создания/редактирования */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingCatalog ? 'Редактировать каталог' : 'Новый каталог'}
                        </Text>
                        <TextInput
                            placeholder="Название каталога"
                            value={catalogName}
                            onChangeText={setCatalogName}
                            style={styles.input}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalBtnText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalSave]}
                                onPress={saveCatalog}
                            >
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Сохранить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ==== Отдельный компонент карточки каталога ====
interface CatalogItemProps {
    item: Catalog;
    index: number;
    onEdit: (item: Catalog) => void;
    onDelete: (item: Catalog) => void;
    onOpen: (item: Catalog) => void;
}

const CatalogItem: React.FC<CatalogItemProps> = ({ item, index, onEdit, onDelete, onOpen }) => {
    const translateAnim = new Animated.Value(30);
    const opacityAnim = new Animated.Value(0);

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(translateAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 70,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 70,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                { transform: [{ translateY: translateAnim }], opacity: opacityAnim },
            ]}
        >
            <TouchableOpacity style={styles.cardContent} onPress={() => onOpen(item)}>
                <Ionicons name="folder" size={28} color="#0a58ff" style={{ marginRight: 12 }} />
                <Text style={styles.cardTitle}>{item.name}</Text>
            </TouchableOpacity>

            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => onEdit(item)}>
                    <Ionicons name="create-outline" size={22} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item)} style={{ marginLeft: 12 }}>
                    <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 10,
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#0b2340',
    },
    addButton: {
        backgroundColor: '#0a58ff',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 15,
        marginTop: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        color: '#0b2340',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'PlayfairDisplay_700Bold',
        marginBottom: 12,
        color: '#0b2340',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginLeft: 8,
    },
    modalCancel: {
        backgroundColor: '#e5e7eb',
    },
    modalSave: {
        backgroundColor: '#0a58ff',
    },
    modalBtnText: {
        fontFamily: 'Inter_600SemiBold',
        color: '#0b2340',
    },
});
export default CatalogScreen;
