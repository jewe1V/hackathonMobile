import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React from "react";

export const Header = (
    {
        title = "Деятельность депутата",
        subTitle = "Екатеринбургская городская Дума"
    }
    ) => {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Image
                    resizeMode="contain"
                    source={require('@/assets/images/ekb-emblem.png')}
                    style={styles.emblem}
                />
                <View>
                    <Text style={styles.hTitle}>{title}</Text>
                    <Text style={styles.hSub}>{subTitle}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.headerDot}>
                <Text style={{ fontSize: 22 }}>⋯</Text>
            </TouchableOpacity>
        </View>
        )
}

const styles = StyleSheet.create({
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
});
