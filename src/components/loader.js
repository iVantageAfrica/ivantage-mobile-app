import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Theme from '../themes';
import { Spinner } from "native-base";

const Loader = props => {
    const { height = 70, width = 135, size, fullscreen = true, style } = props;

    // Determine spinner size
    let spinnerSize = size;
    if (!spinnerSize) {
        if (height <= 30 || width <= 30) {
            spinnerSize = 'sm';
        } else if (height <= 50 || width <= 50) {
            spinnerSize = 'md';
        } else {
            spinnerSize = 'lg';
        }
    }

    const spinner = (
        <Spinner size={spinnerSize} color={Theme.Colors.primaryText} />
    );

    if (!fullscreen) {
        // Just render the spinner, no overlay
        return <View style={style}>{spinner}</View>;
    }

    return (
        <View style={[styles.container, style]}>
            {spinner}
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

