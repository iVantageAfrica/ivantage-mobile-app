import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { VStack, Box, Image, Text, HStack, ScrollView, Flex } from 'native-base';

import Theme from '../themes';
import Shared from '../themes/shared';

const TransactionItem = (props) => {
    const navigation = props.navigation

    if (props.is_empty) {
        return (
            <Box {...props} mb={2}>
                <HStack space={3} p={3}>
                    <Image w={'1/6'} size={50} borderRadius={100} source={{
                        uri: "https://wallpaperaccess.com/full/317501.jpg"
                    }} alt="Alternate Text" />
                    <VStack w={'3/6'}>
                        <Box _text={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>{props.title ?? props.title}</Box>
                        <Box _text={{ color: '#ffffff', fontSize: 9 }}>{props.subtitle ?? props.subtitle}</Box>
                    </VStack>
                    <Box w={'2/6'} pt={3}>
                        <Box>
                            <Text style={{ color: '#ffffff', fontWeight: 'bold', color: props.is_credit ? '#00b94a' : '#e54b47' }}>{props.amount ?? props.amount}</Text>
                        </Box>
                    </Box>
                </HStack>
            </Box>
        )
    }
    return (
        <Box {...props} mb={2}>
            <Pressable onPress={(e) => {
                navigation.navigate('TransactionSummaryScreen', { transaction: props.transaction })
            }}>
                <Flex my={5} direction='row' justify='space-between'>
                    <Box flex={2} mx={3}>
                        <Flex direction='row'>
                            <Image mx={3} size={30} borderRadius={15} source={{
                                uri: "https://wallpaperaccess.com/full/317501.jpg"
                            }} alt="Alternate Text" />
                            <Box flex={1}>
                                <Box _text={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>{props.title ?? props.title}</Box>
                                <Box _text={{ color: '#ffffff', fontSize: 9 }}>{props.subtitle ?? props.subtitle}</Box>
                            </Box>
                        </Flex>
                    </Box>
                    <Box mx={3} pr={3} flex={1}><Text textAlign={'right'} style={{ color: '#ffffff', fontWeight: 'bold', color: props.is_credit ? '#00b94a' : '#fcb077' }}>{props.amount ?? props.amount}</Text></Box>
                </Flex>
                </Pressable>
        </Box>
    )
}

export default TransactionItem