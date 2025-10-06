import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

type Props = {
    dates: string[]; // array of date labels
    active?: string;
    onSelect?: (d: string) => void;
};

export const Timeline: React.FC<Props> = ({ dates, active, onSelect }) => {
    return (
        <View style={styles.wrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 6 }}>
                {dates.map((d) => {
                    const isActive = d === active;
                    return (
                        <TouchableOpacity key={d} style={[styles.item, isActive && styles.itemActive]} onPress={() => onSelect?.(d)}>
                            <Text style={[styles.itemText, isActive && styles.itemTextActive]}>{d}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        marginVertical: 12,
    },
    item: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eef2ff',
        elevation: 1,
    },
    itemActive: {
        backgroundColor: '#0a58ff',
    },
    itemText: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#3b4754',
    },
    itemTextActive: {
        color: '#fff',
        fontFamily: 'Inter_600SemiBold',
    },
});
