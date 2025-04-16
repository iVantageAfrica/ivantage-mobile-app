import React from 'react';
import { StyleSheet } from 'react-native';
import { VStack, Box, Image, Text, HStack, Button } from 'native-base';

import Theme from '../themes';
import Shared from '../themes/shared';

const BigCardEmpty = (props) => {
    const card_color = props.color ? props.color : 'orange.800'
    return (
        <Box
        {...props}
        p={3}
        shadow={3}

            h={200}
            bg={{
                linearGradient: {
                    colors: [Theme.Colors.backgroundColor, card_color],
                    start: [0, 0],
                    end: [1, 0]
                }
            }}
            style={styles.container} >
            <VStack >
                <Image style={{ position: 'absolute', height: 185 }} alt={'test'} source={Theme.Images.cardbg} />
                <HStack>
                    <VStack w={'4/5'}>
                        <Box _text={{ color: '#ffffff', fontSize: 18 }} >
                            {props.title ?? props.title}
                        </Box>
                        <Box>
                            <HStack space={2}>
                                {props.subtitleIcon ?? props.subtitleIcon}
                                <Text style={{ color: '#ffffff', fontSize: 13 }} mt={2}>{props.subtitle ?? props.subtitle}</Text>
                            </HStack>

                        </Box>
                        <Box mt={7}>
                            {props.onButtonPress && props.onButtonText && <Button onPress={()=> props.onButtonPress()} variant={'solid'} size={'md'} style={Shared.Button.primary}>{props.onButtonText}</Button>}
                        </Box>
                    </VStack>
                    <VStack style={{flexDirection: 'row'}}>
                    {props.cardIcon ?? props.cardIcon}
                    </VStack>
                </HStack>

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

export default BigCardEmpty