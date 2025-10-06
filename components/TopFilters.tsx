import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type Props = {
    current: string;
    onChange: (c: string) => void;
};

const FILTERS = ['Все', 'Законопроекты', 'Встречи', 'Новости'];

export const TopFilters: React.FC<Props> = ({ current, onChange }) => {
    return (
        <View style={styles.wrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 6 }}>
                {FILTERS.map((f) => {
                    const active = f === current;
                    return (
                        <TouchableOpacity key={f} style={[styles.chip, active && styles.chipActive]} onPress={() => onChange(f)}>
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { marginTop: 14, marginBottom: 6 },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'transparent',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: '#0a58ff',
        borderColor: '#0a58ff',
    },
    chipText: {
        fontSize: 14,
        color: '#425066',
        fontFamily: 'Inter_400Regular',
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '700',
        fontFamily: 'Inter_600SemiBold',
    },
});
