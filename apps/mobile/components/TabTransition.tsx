import React, { useCallback } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';

// Global state to track previous tab index
let previousIndex = 0;

interface TabTransitionProps extends ViewProps {
    children: React.ReactNode;
    index: number;
}

export function TabTransition({ children, index, style, ...rest }: TabTransitionProps) {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    useFocusEffect(
        useCallback(() => {
            let isMovingRight = true;
            if (index !== previousIndex) {
                isMovingRight = index > previousIndex;
            }

            // Setup initial state for animation
            translateX.value = isMovingRight ? 60 : -60;
            opacity.value = 0;

            // Animate to final state
            translateX.value = withSpring(0, {
                damping: 20,
                stiffness: 90,
                mass: 0.5,
            });
            opacity.value = withTiming(1, {
                duration: 300,
                easing: Easing.out(Easing.cubic),
            });

            // Update global previous index for the next navigation
            previousIndex = index;
        }, [index])
    );

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle, style]} {...rest}>
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
