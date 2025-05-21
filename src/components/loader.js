import React, { useEffect } from "react";
import { View, Animated, Easing, StyleSheet, Dimensions, Text } from "react-native";
import Theme from '../themes';

const Loader = props => {
    const { height = 70, width = 135 } = props;

    const spinValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.timing(
                spinValue,
                {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true 
                }
            )
        ).start();
    }, [spinValue])

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })
    return (
        <View style={styles.container}>
            <View>
                <Animated.Image
                    style={{
                        resizeMode: 'contain', height, width, transform: [{ rotate: spin }]
                    }}
                    source={Theme.Images.appicon} />
            </View>
        </View>
    );
};

let ScreenWidth = Dimensions.get("window").width;
let ScreenHeight = Dimensions.get("window").height + 50;
let styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.Colors.backgroundColor,
        height: ScreenHeight,
        width: ScreenWidth,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        opacity: 1
    },
});

export default Loader;

