import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

const RadioBtn = ({ label, selected, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
             <Text style={[styles.title, { color: selected ? '#32db64' : '#b8b6a2' }]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    title: {
        fontFamily: 'STC-Regular',
        fontSize: 16,
        lineHeight: 30,
    },
})

export default RadioBtn
