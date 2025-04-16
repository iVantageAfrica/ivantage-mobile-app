import React, {memo} from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Box, Image, Text, HStack } from 'native-base';

import Theme from '../themes';
import Shared from '../themes/shared';

const Card = (props) => {
    const card_color = props.color ? props.color : 'orange.800'
    return (
        <TouchableOpacity
        onPress={props.onPress}
        >
        <Box
        {...props}
        
        shadow={3}
            h={145}
            bg={{
                linearGradient: {
                    colors: [Theme.Colors.backgroundColor, card_color],
                    start: [0, 0],
                    end: [1, 0]
                }
            }}
            style={styles.container} >
            <VStack >
                <Image style={{ position: 'absolute' }} alt={'test'} source={Theme.Images.cardbg} />
                <HStack>
                    <VStack w={'4/5'}>
                        <Box _text={{ color: '#ffffff', fontSize: 16 }} px="2">
                            {props.title ?? props.title}
                        </Box>
                        <Box px="2">
                            <HStack space={2}>
                                {props.subtitleIcon ?? props.subtitleIcon}
                                <Text style={{ color: '#ffffff', fontSize: 13 }} mt={2}>{props.subtitle ?? props.subtitle}</Text>
                            </HStack>

                        </Box>
                    </VStack>
                    <VStack style={{flexDirection: 'row'}}>
                    {props.cardIcon ?? props.cardIcon}
                    </VStack>
                </HStack>
                {props.actionBtn && <Box>
                {props.actionBtn}    
                </Box>}
            </VStack>
        </Box></TouchableOpacity>
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

export default memo(Card)