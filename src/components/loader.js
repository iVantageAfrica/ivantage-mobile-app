import React, { useEffect } from "react";
import { View, Animated, Easing, StyleSheet, Dimensions, Text } from "react-native";
import Theme from '../themes';
import { Spinner } from "native-base";

const Loader = props => {
    const { height = 70, width = 135 } = props;

    // Remove unused animation code
    // const spinValue = new Animated.Value(0);

    // useEffect(() => {
    //     Animated.loop(
    //         Animated.timing(
    //             spinValue,
    //             {
    //                 toValue: 1,
    //                 duration: 1000,
    //                 easing: Easing.linear,
    //                 useNativeDriver: true 
    //             }
    //         )
    //     ).start();
    // }, [spinValue])

    // const spin = spinValue.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: ['0deg', '360deg']
    // })

    // Determine spinner size based on height/width props or use a default
    let spinnerSize = 'lg'; // Default size
    if (height <= 30 || width <= 30) {
        spinnerSize = 'sm';
    } else if (height <= 50 || width <= 50) {
        spinnerSize = 'md';
    }

    return (
        <View style={styles.container}>
            <View>
                {/* Replace Animated.Image with Spinner */}
                <Spinner size={spinnerSize} color={Theme.Colors.primaryText} />
                {/* <Animated.Image
                    style={{
                        resizeMode: 'contain', height, width, transform: [{ rotate: spin }]
                    }}
                    source={Theme.Images.appicon} /> */}
            </View>
        </View>
    );
};

let ScreenWidth = Dimensions.get("window").width;
let ScreenHeight = Dimensions.get("window").height;
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

