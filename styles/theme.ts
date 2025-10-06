import { StyleSheet } from 'react-native';

export const COLORS = {
    primary: '#1E3A8A',       // насыщенный синий — акцент
    secondary: '#4B5563',     // тёмно-серый текст
    background: '#F7F9FC',    // фоновый бело-серый
    white: '#FFFFFF',
    border: '#E5E7EB',
    placeholder: '#A0A8B0',
};

export const FONTS = {
    title: 'PlayfairDisplay_700Bold',
    text: 'Inter_400Regular',
    textBold: 'Inter_600SemiBold',
};

export const SIZES = {
    padding: 24,
    radius: 12,
    inputHeight: 48,
    title: 28,
    subtitle: 14,
    text: 16,
    button: 16,
};

export const theme = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    title: {
        fontFamily: FONTS.title,
        fontSize: SIZES.title,
        color: COLORS.primary,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: FONTS.text,
        fontSize: SIZES.subtitle,
        color: COLORS.secondary,
        textAlign: 'center',
        marginTop: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 14,
        fontFamily: FONTS.text,
        fontSize: SIZES.text,
        color: '#111827',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: SIZES.radius,
        marginTop: 8,
    },
    buttonPrimaryText: {
        color: COLORS.white,
        textAlign: 'center',
        fontFamily: FONTS.textBold,
        fontSize: SIZES.button,
    },
    buttonSecondary: {
        paddingVertical: 14,
        borderRadius: SIZES.radius,
        marginTop: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    buttonSecondaryText: {
        color: COLORS.primary,
        textAlign: 'center',
        fontFamily: FONTS.textBold,
        fontSize: SIZES.button,
    },
});
