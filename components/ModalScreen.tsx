import React from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ModalScreenProps} from "@/models/Event";
import {getDisplayDate} from "@/utils"
export const ModalScreen: React.FC<ModalScreenProps> = ({ modalPost, onClose, onShare }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.modalClose}>◀︎</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                {modalPost && (
                    <TouchableOpacity onPress={() => onShare(modalPost)}>
                        <Text style={styles.modalShare}>↗︎</Text>
                    </TouchableOpacity>
                )}
            </View>
            {modalPost && (
                <ScrollView
                    contentContainerStyle={{ padding: 18 }}
                    showsVerticalScrollIndicator={false}
                >
                    {modalPost.thumbnailUrl && (
                        <Image
                            source={{ uri: modalPost.thumbnailUrl }}
                            style={styles.modalImage}
                            resizeMode="cover"
                        />
                    )}

                    {/* Убрана категория, так как её нет в новой модели */}

                    <Text style={styles.modalTitle}>{modalPost.title}</Text>

                    <Text style={styles.modalDate}>
                        {getDisplayDate(modalPost)}
                    </Text>

                    <Text style={styles.modalBody}>{modalPost.body}</Text>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#f6f7fb'
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6f7fb'
    },

    header: {
        marginTop: 12,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    emblem: {
        width: 52,
        height: 52,
        marginRight: 12
    },
    hTitle: {
        fontSize: 18,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#0b2340'
    },
    hSub: {
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'Inter_400Regular'
    },
    headerDot: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },

    bottomNav: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 66,
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    navItem: {
        alignItems: 'center'
    },
    navText: {
        fontSize: 13,
        color: '#6b7280',
        fontFamily: 'Inter_400Regular'
    },
    navActive: {
        color: '#0a58ff',
        fontFamily: 'Inter_600SemiBold'
    },

    /* modal */
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff'
    },
    modalHeader: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalClose: {
        fontSize: 22,
        color: '#0a58ff'
    },
    modalShare: {
        fontSize: 20,
        color: '#0a58ff'
    },
    modalImage: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        marginBottom: 16
    },
    modalCate: {
        fontSize: 13,
        color: '#0a58ff',
        marginBottom: 8,
        fontFamily: 'Inter_600SemiBold'
    },
    modalTitle: {
        fontSize: 28,
        marginBottom: 8,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#0b2140'
    },
    modalDate: {
        fontSize: 12,
        color: '#7b8794',
        marginBottom: 12,
        fontFamily: 'Inter_400Regular'
    },
    modalBody: {
        fontSize: 16,
        color: '#344054',
        lineHeight: 22,
        fontFamily: 'Inter_400Regular'
    },
});
