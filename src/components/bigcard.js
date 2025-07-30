import React from 'react';
import { StyleSheet } from 'react-native';
import { VStack, Box, Image, Text, HStack } from 'native-base';

import Theme from '../themes';
import Shared from '../themes/shared';

const BigCard = (props) => {
    const card_color = props.color ? props.color : 'orange.800'
    return (
        <Box
            {...props}
            p={3}
            shadow={3}
            h={250}
            bg={card_color}
            style={styles.container}
        >
            <VStack>
                <Image style={{ position: 'absolute', height: 235 }} alt={'test'} source={Theme.Images.cardbg} />
                <HStack>
                    <VStack w={'4/5'}>
                        <Box _text={{ color: '#ffffff', fontSize: 16 }}>
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
            </VStack>
            <VStack px={5}>
                <Box mb={2} _text={{ color: '#ffffff', fontSize: 12, textAlign: 'center' }} px="2">
                    {props.label2_subtitle ?? props.label2_subtitle}
                </Box>
                <Box _text={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }} px="2">
                    {props.label2_title ?? props.label2_title}
                </Box>
                {(props.label3_title || props.label4_title) && <Box>
                    <HStack>
                        <Box w={'1/2'} px="2">
                            <VStack>
                                <Text style={{ color: '#ffffff', fontSize: 11, textAlign: 'center' }}>{props.label3_subtitle ?? props.label3_subtitle}</Text>
                                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight:'bold', textAlign: 'center' }}>{props.label3_title ?? props.label3_title}</Text>
                            </VStack>
                        </Box>
                        <Box w={'1/2'} px="2">
                            <VStack>
                                <Text style={{ color: '#ffffff', fontSize: 11, textAlign: 'center' }}>{props.label4_subtitle ?? props.label4_subtitle}</Text>
                                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight:'bold', textAlign: 'center' }}>{props.label4_title ?? props.label4_title}</Text>
                            </VStack>
                        </Box>
                    </HStack>
                </Box>}
                <Box mt={3}>
                    <HStack space={3}>
                        {props.label5_title && <Box w={'1/3'} style={{backgroundColor:Theme.Colors.backgroundColor}} px="2">
                            <VStack>
                                <Text style={{ color: '#ffffff', fontSize: 10, textAlign: 'center' }}>{props.label5_subtitle ?? props.label5_subtitle}</Text>
                                <Text style={{ color: '#ffffff', fontSize: 10, textAlign: 'center' }}>{props.label5_title ?? props.label5_title}</Text>
                            </VStack>
                        </Box>}
                        {props.label6_title && <Box w={'1/3'} style={{backgroundColor:Theme.Colors.backgroundColor}} px="2">
                            <VStack>
                                <Text style={{ color: '#ffffff', fontSize: 10, textAlign: 'center' }}>{props.label6_subtitle ?? props.label6_subtitle}</Text>
                                <Text style={{ color: '#ffffff', fontSize: 10, textAlign: 'center' }}>{props.label6_title ?? props.label6_title}</Text>
                            </VStack>
                        </Box>}
                        {props.label7_title && <Box w={'1/3'} style={{backgroundColor:Theme.Colors.backgroundColor}} px="2">
                            <VStack>
                                <Text style={{ color: '#ffffff', fontSize: 10, textAlign: 'center' }}>{props.label7_subtitle ?? props.label7_subtitle}</Text>
                                <Text style={{ color: '#ffffff', fontSize: 10, textAlign: 'center' }}>{props.label7_title ?? props.label7_title}</Text>
                            </VStack>
                        </Box>}
                    </HStack>
                </Box>
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

export default BigCard