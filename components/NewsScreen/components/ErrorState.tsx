import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

interface Props {
    onRetry: () => void;
}

export const ErrorState: React.FC<Props> = ({ onRetry }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 100 }]}>
            <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>⚠️</Text>
            </View>
            <Text style={styles.emptyTitle}>Не удалось загрузить новости</Text>
            <Text style={styles.emptySubtitle}>
                Проверьте подключение к интернету и попробуйте ещё раз
            </Text>
        </View>
    );
};
