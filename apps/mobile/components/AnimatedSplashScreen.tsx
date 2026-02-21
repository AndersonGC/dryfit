import { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

// Prevent auto hide of the native splash screen
SplashScreen.preventAutoHideAsync();

interface AnimatedSplashScreenProps {
    onFinish: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
    const [isAppReady, setAppReady] = useState(false);

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    useEffect(() => {
        // Hide native splash screen immediately so our custom animation is visible
        SplashScreen.hideAsync();

        // Initial bounce in animation for the logo
        scale.value = withSpring(1.05, { damping: 14, stiffness: 90 });

        // Fade in and slide up the text
        textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
        textTranslateY.value = withDelay(600, withSpring(0, { damping: 14, stiffness: 90 }));

        // Wait a minimum time to show the splash screen, then consider app ready
        const timer = setTimeout(() => {
            setAppReady(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isAppReady) {
            // Animate out (fade out the whole screen)
            scale.value = withTiming(0.95, { duration: 400 });
            opacity.value = withDelay(
                100,
                withTiming(0, { duration: 400 }, (finished) => {
                    if (finished) {
                        runOnJS(onFinish)();
                    }
                })
            );
        }
    }, [isAppReady]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    return (
        <Animated.View style={[StyleSheet.absoluteFill, animatedContainerStyle, { backgroundColor: '#0a0a0a', zIndex: 9999, justifyContent: 'center', alignItems: 'center' }]}>
            <Animated.View style={[logoStyle, { alignItems: 'center' }]}>
                <Image
                    source={require('../assets/images/icon.png')}
                    style={{ width: 140, height: 140, borderRadius: 36, marginBottom: 24 }}
                    resizeMode="contain"
                />
                <Animated.View style={textStyle}>
                    <Text className="text-4xl font-bold tracking-widest text-[#b30f15]">
                        DRYFIT
                    </Text>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
}
