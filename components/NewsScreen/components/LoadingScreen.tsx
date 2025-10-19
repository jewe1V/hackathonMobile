import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

export const LoadingScreen = () => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.loading, { paddingTop: insets.top }]}>
            <ActivityIndicator size="large" color="#0a58ff" />
        </View>
    );
};

