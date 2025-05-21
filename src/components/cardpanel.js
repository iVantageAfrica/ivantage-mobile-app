import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Box, Image, Text, HStack } from 'native-base';

import Theme from '../themes';
import Shared from '../themes/shared';

const CardPanel = (props) => {
    const card_color = props.color ? props.color : 'orange.700'
    return (
        <Box
            {...props}

            shadow={3}
            h={props.h ?? 165}
            bg={{
                linearGradient: {
                    colors: [Theme.Colors.backgroundColor, card_color],
                    start: [0, 0],
                    end: [1, 0]
                }
            }}
            style={styles.container} >
            <VStack >
                <Image mb={0} style={{ position: 'absolute', bottom: 10 }} alt={'image'} source={Theme.Images.cardbg} />
                {props.children && <VStack>
                    {props.children}
                </VStack>}
                {props.actionBtn && <Box>
                    {props.actionBtn}
                </Box>}
            </VStack>
        </Box>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: Theme.Colors.backgroundColor,
        marginBottom: 7,
        marginTop: 7,
        borderRadius: 10
    }
});

export default memo(CardPanel)