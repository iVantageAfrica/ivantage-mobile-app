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
            shadow={2}
            h={props.h ?? 165}
            bg={card_color}
            style={styles.container}
        >
            <VStack>
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
        borderColor: Theme.Colors.cardColor,
        marginBottom: 7,
        marginTop: 7,
        borderRadius: 12
    }
});

export default memo(CardPanel)