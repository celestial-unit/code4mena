import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useMascot } from '../../contexts/MascotContext';
import { MascotCulturalVariation, MascotEmotion } from '../../types/mascot';

interface TunisianFennecMascotProps {
    size?: number;
    interactive?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const TunisianFennecMascot: React.FC<TunisianFennecMascotProps> = ({
    size = 200,
    interactive = true
}) => {
    const { theme } = useTheme();
    const { mascotState, triggerInteraction } = useMascot();

    // Animation values
    const rotateX = useRef(new Animated.Value(0)).current;
    const rotateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const bounceY = useRef(new Animated.Value(0)).current;
    const shadowOpacity = useRef(new Animated.Value(0.3)).current;
    const eyeScale = useRef(new Animated.Value(1)).current;
    const earWiggle = useRef(new Animated.Value(0)).current;
    const tailWag = useRef(new Animated.Value(0)).current;

    // Fennec-specific animations
    useEffect(() => {
        // Ear wiggling animation
        const wiggleEars = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(earWiggle, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(earWiggle, {
                        toValue: -1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(earWiggle, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Tail wagging animation
        const wagTail = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(tailWag, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(tailWag, {
                        toValue: -1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Idle breathing animation
        const breathe = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceY, {
                        toValue: -3,
                        duration: 2500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceY, {
                        toValue: 0,
                        duration: 2500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Blinking animation
        const blink = () => {
            const doBlink = () => {
                Animated.sequence([
                    Animated.timing(eyeScale, {
                        toValue: 0.1,
                        duration: 80,
                        useNativeDriver: true,
                    }),
                    Animated.timing(eyeScale, {
                        toValue: 1,
                        duration: 80,
                        useNativeDriver: true,
                    }),
                ]).start();

                setTimeout(doBlink, Math.random() * 4000 + 2000);
            };
            doBlink();
        };

        wiggleEars();
        wagTail();
        breathe();
        blink();
    }, []);

    // Emotion-based animations
    useEffect(() => {
        switch (mascotState.currentEmotion) {
            case MascotEmotion.HAPPY:
                Animated.parallel([
                    Animated.spring(scale, {
                        toValue: 1.15,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceY, {
                        toValue: -20,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    Animated.parallel([
                        Animated.spring(scale, {
                            toValue: 1,
                            useNativeDriver: true,
                        }),
                        Animated.spring(bounceY, {
                            toValue: 0,
                            useNativeDriver: true,
                        }),
                    ]).start();
                });
                break;

            case MascotEmotion.EXCITED:
                // Fast tail wagging for excitement
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(tailWag, {
                            toValue: 1.5,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(tailWag, {
                            toValue: -1.5,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]),
                    { iterations: 6 }
                ).start();
                break;

            case MascotEmotion.THINKING:
                // Slow ear tilt for thinking
                Animated.timing(earWiggle, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
                break;
        }
    }, [mascotState.currentEmotion]);

    const getCulturalColors = () => {
        const { culturalVariation } = mascotState.customization;

        switch (culturalVariation) {
            case MascotCulturalVariation.TRADITIONAL:
                return {
                    body: ['#F5DEB3', '#DEB887'], // Sandy desert colors
                    ears: ['#CD853F', '#A0522D'], // Darker sandy brown
                    accent: ['#DAA520', '#FFD700'], // Gold accents
                    shadow: '#8B4513',
                    nose: '#8B4513',
                    clothing: ['#8B4513', '#A0522D'], // Traditional brown
                };
            case MascotCulturalVariation.MODERN:
                return {
                    body: ['#F5DEB3', '#DEB887'],
                    ears: ['#CD853F', '#A0522D'],
                    accent: [theme.colors.primary, theme.colors.primaryLight],
                    shadow: theme.colors.primary,
                    nose: '#8B4513',
                    clothing: [theme.colors.primary, theme.colors.primaryLight],
                };
            case MascotCulturalVariation.COASTAL:
                return {
                    body: ['#F5DEB3', '#DEB887'],
                    ears: ['#4682B4', '#87CEEB'], // Ocean blue ears
                    accent: ['#20B2AA', '#48D1CC'], // Turquoise accents
                    shadow: '#4682B4',
                    nose: '#2F4F4F',
                    clothing: ['#4682B4', '#87CEEB'],
                };
            case MascotCulturalVariation.DESERT:
                return {
                    body: ['#DEB887', '#F5DEB3'], // Lighter desert tones
                    ears: ['#CD853F', '#D2B48C'],
                    accent: ['#DAA520', '#FFD700'],
                    shadow: '#CD853F',
                    nose: '#8B4513',
                    clothing: ['#CD853F', '#D2B48C'],
                };
            default:
                return {
                    body: ['#F5DEB3', '#DEB887'],
                    ears: ['#CD853F', '#A0522D'],
                    accent: [theme.colors.accent, theme.colors.accentLight],
                    shadow: theme.colors.primary,
                    nose: '#8B4513',
                    clothing: [theme.colors.primary, theme.colors.primaryLight],
                };
        }
    };

    const colors = getCulturalColors();

    const handleGesture = (event: any) => {
        if (!interactive) return;

        const { translationX, translationY, state } = event.nativeEvent;

        if (state === State.ACTIVE) {
            const rotateXValue = (translationY / size) * 25;
            const rotateYValue = (translationX / size) * 25;

            Animated.parallel([
                Animated.timing(rotateX, {
                    toValue: rotateXValue,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateY, {
                    toValue: rotateYValue,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shadowOpacity, {
                    toValue: 0.6,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (state === State.END) {
            Animated.parallel([
                Animated.spring(rotateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
                Animated.spring(rotateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(shadowOpacity, {
                    toValue: 0.3,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Trigger interaction
            triggerInteraction({
                trigger: 'help',
                emotion: mascotState.currentEmotion,
                animation: {
                    type: 'interaction',
                    duration: 500,
                    easing: 'bounce'
                }
            });
        }
    };

    const rotateXInterpolate = rotateX.interpolate({
        inputRange: [-25, 25],
        outputRange: ['-25deg', '25deg'],
    });

    const rotateYInterpolate = rotateY.interpolate({
        inputRange: [-25, 25],
        outputRange: ['-25deg', '25deg'],
    });

    const earWiggleInterpolate = earWiggle.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-8deg', '8deg'],
    });

    const tailWagInterpolate = tailWag.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-15deg', '15deg'],
    });

    return (
        <PanGestureHandler onGestureEvent={handleGesture} onHandlerStateChange={handleGesture}>
            <Animated.View style={[styles.container, { width: size, height: size }]}>
                {/* Dynamic Shadow */}
                <Animated.View
                    style={[
                        styles.shadow,
                        {
                            width: size * 0.8,
                            height: size * 0.25,
                            borderRadius: size * 0.4,
                            backgroundColor: colors.shadow,
                            opacity: shadowOpacity,
                            transform: [
                                { translateY: size * 0.45 },
                                { scaleX: scale },
                            ],
                        },
                    ]}
                />

                {/* Main Fennec Body */}
                <Animated.View
                    style={[
                        styles.fennecBody,
                        {
                            transform: [
                                { translateY: bounceY },
                                { perspective: 1000 },
                                { rotateX: rotateXInterpolate },
                                { rotateY: rotateYInterpolate },
                                { scale: scale },
                            ],
                        },
                    ]}
                >
                    {/* Tail */}
                    <Animated.View
                        style={[
                            styles.tailContainer,
                            {
                                transform: [{ rotate: tailWagInterpolate }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={colors.body as [string, string, ...string[]]}
                            style={[
                                styles.tail,
                                {
                                    width: size * 0.4,
                                    height: size * 0.15,
                                    borderRadius: size * 0.075,
                                    right: -size * 0.15,
                                    top: size * 0.3,
                                },
                            ]}
                        />
                        {/* Tail tip */}
                        <LinearGradient
                            colors={colors.ears as [string, string, ...string[]]}
                            style={[
                                styles.tailTip,
                                {
                                    width: size * 0.08,
                                    height: size * 0.08,
                                    borderRadius: size * 0.04,
                                    right: -size * 0.25,
                                    top: size * 0.32,
                                },
                            ]}
                        />
                    </Animated.View>

                    {/* Body Base */}
                    <LinearGradient
                        colors={colors.body as [string, string, ...string[]]}
                        style={[
                            styles.bodyBase,
                            {
                                width: size * 0.6,
                                height: size * 0.7,
                                borderRadius: size * 0.3,
                            },
                        ]}
                    />

                    {/* Chest marking */}
                    <LinearGradient
                        colors={['#FFFFFF', '#F8F8FF']}
                        style={[
                            styles.chestMarking,
                            {
                                width: size * 0.35,
                                height: size * 0.45,
                                borderRadius: size * 0.175,
                                top: size * 0.15,
                            },
                        ]}
                    />

                    {/* Head */}
                    <LinearGradient
                        colors={colors.body as [string, string, ...string[]]}
                        style={[
                            styles.head,
                            {
                                width: size * 0.5,
                                height: size * 0.45,
                                borderRadius: size * 0.225,
                                top: -size * 0.15,
                            },
                        ]}
                    />

                    {/* Large Fennec Ears */}
                    <Animated.View
                        style={[
                            styles.leftEar,
                            {
                                transform: [{ rotate: earWiggleInterpolate }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={colors.ears as [string, string, ...string[]]}
                            style={[
                                styles.earOuter,
                                {
                                    width: size * 0.25,
                                    height: size * 0.35,
                                    borderRadius: size * 0.125,
                                    left: size * 0.15,
                                    top: -size * 0.25,
                                },
                            ]}
                        />
                        <LinearGradient
                            colors={['#FFB6C1', '#FFC0CB']}
                            style={[
                                styles.earInner,
                                {
                                    width: size * 0.15,
                                    height: size * 0.25,
                                    borderRadius: size * 0.075,
                                    left: size * 0.2,
                                    top: -size * 0.2,
                                },
                            ]}
                        />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.rightEar,
                            {
                                transform: [{ rotate: earWiggleInterpolate }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={colors.ears as [string, string, ...string[]]}
                            style={[
                                styles.earOuter,
                                {
                                    width: size * 0.25,
                                    height: size * 0.35,
                                    borderRadius: size * 0.125,
                                    right: size * 0.15,
                                    top: -size * 0.25,
                                },
                            ]}
                        />
                        <LinearGradient
                            colors={['#FFB6C1', '#FFC0CB']}
                            style={[
                                styles.earInner,
                                {
                                    width: size * 0.15,
                                    height: size * 0.25,
                                    borderRadius: size * 0.075,
                                    right: size * 0.2,
                                    top: -size * 0.2,
                                },
                            ]}
                        />
                    </Animated.View>

                    {/* Eyes */}
                    <Animated.View
                        style={[
                            styles.leftEye,
                            {
                                width: size * 0.08,
                                height: size * 0.08,
                                borderRadius: size * 0.04,
                                left: size * 0.32,
                                top: size * 0.02,
                                transform: [{ scaleY: eyeScale }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.rightEye,
                            {
                                width: size * 0.08,
                                height: size * 0.08,
                                borderRadius: size * 0.04,
                                right: size * 0.32,
                                top: size * 0.02,
                                transform: [{ scaleY: eyeScale }],
                            },
                        ]}
                    />

                    {/* Eye shine */}
                    <View
                        style={[
                            styles.eyeShine,
                            {
                                width: size * 0.025,
                                height: size * 0.025,
                                borderRadius: size * 0.0125,
                                left: size * 0.34,
                                top: size * 0.03,
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.eyeShine,
                            {
                                width: size * 0.025,
                                height: size * 0.025,
                                borderRadius: size * 0.0125,
                                right: size * 0.34,
                                top: size * 0.03,
                            },
                        ]}
                    />

                    {/* Nose */}
                    <View
                        style={[
                            styles.nose,
                            {
                                width: size * 0.04,
                                height: size * 0.03,
                                borderRadius: size * 0.02,
                                backgroundColor: colors.nose,
                                top: size * 0.08,
                            },
                        ]}
                    />

                    {/* Mouth */}
                    <View
                        style={[
                            styles.mouth,
                            {
                                width: size * 0.15,
                                height: size * 0.08,
                                borderRadius: size * 0.075,
                                top: size * 0.12,
                                borderWidth: size * 0.008,
                            },
                        ]}
                    />

                    {/* Cultural Accessories */}
                    {mascotState.customization.accessories.includes('olive_branch') && (
                        <LinearGradient
                            colors={['#228B22', '#32CD32'] as [string, string, ...string[]]}
                            style={[
                                styles.oliveBranch,
                                {
                                    width: size * 0.12,
                                    height: size * 0.06,
                                    borderRadius: size * 0.03,
                                    right: -size * 0.02,
                                    top: size * 0.05,
                                },
                            ]}
                        />
                    )}

                    {/* Traditional Tunisian Collar */}
                    {mascotState.customization.culturalVariation === MascotCulturalVariation.TRADITIONAL && (
                        <LinearGradient
                            colors={colors.accent as [string, string, ...string[]]}
                            style={[
                                styles.traditionalCollar,
                                {
                                    width: size * 0.55,
                                    height: size * 0.08,
                                    borderRadius: size * 0.04,
                                    top: size * 0.25,
                                },
                            ]}
                        />
                    )}
                </Animated.View>
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    shadow: {
        position: 'absolute',
        bottom: 0,
    },
    fennecBody: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    tailContainer: {
        position: 'absolute',
    },
    tail: {
        position: 'absolute',
    },
    tailTip: {
        position: 'absolute',
    },
    bodyBase: {
        position: 'absolute',
    },
    chestMarking: {
        position: 'absolute',
    },
    head: {
        position: 'absolute',
    },
    leftEar: {
        position: 'absolute',
    },
    rightEar: {
        position: 'absolute',
    },
    earOuter: {
        position: 'absolute',
    },
    earInner: {
        position: 'absolute',
    },
    leftEye: {
        position: 'absolute',
        backgroundColor: '#333333',
    },
    rightEye: {
        position: 'absolute',
        backgroundColor: '#333333',
    },
    eyeShine: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
    },
    nose: {
        position: 'absolute',
    },
    mouth: {
        position: 'absolute',
        backgroundColor: 'transparent',
        borderColor: '#333333',
        borderTopWidth: 0,
    },
    oliveBranch: {
        position: 'absolute',
    },
    traditionalCollar: {
        position: 'absolute',
    },
});