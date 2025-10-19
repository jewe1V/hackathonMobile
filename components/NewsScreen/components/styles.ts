import { StyleSheet } from "react-native";
import {
    useFonts as usePlayfair,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#f6f7fb',
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6f7fb',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#f6f7fb',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e8ecf8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyIconText: {
        fontSize: 32,
    },
    emptyTitle: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 12,
        color: '#1a1a1a',
        lineHeight: 32,
    },
    emptySubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 22,
        marginBottom: 32,
    },
    retryButton: {
        backgroundColor: '#0a58ff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 160,
        alignItems: 'center',
    },
    retryButtonText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: 'white',
    },
});
