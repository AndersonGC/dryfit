import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    containerClassName?: string;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Buscar...',
    containerClassName = 'mb-6',
    ...rest
}: SearchBarProps) {
    return (
        <View className={`relative ${containerClassName}`}>
            <Ionicons
                name="search-outline"
                size={20}
                color="#71717a"
                style={{ position: 'absolute', left: 16, top: 14, zIndex: 1 }}
            />
            <TextInput
                className="w-full pl-12 pr-12 py-4 bg-zinc-900 rounded-2xl text-white"
                placeholder={placeholder}
                placeholderTextColor="#52525b"
                value={value}
                onChangeText={onChangeText}
                style={{ fontSize: 15 }}
                {...rest}
            />
            <Ionicons
                name="options-outline"
                size={20}
                color="#71717a"
                style={{ position: 'absolute', right: 16, top: 14 }}
            />
        </View>
    );
}
