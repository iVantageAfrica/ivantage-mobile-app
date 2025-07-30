import React from 'react';
import {TouchableOpacity} from 'react-native'
import { VStack, Box, Image, Text, HStack } from 'native-base';
import Theme from '../themes';
const ListItem = (props) => {
    return (
        <>
            <HStack minH={30} mx={3} shadow={1} style={{ backgroundColor: Theme.Colors.backgroundColorAlt}} mb={1} space={1}>
                {props.imgsrc && <Image m={3} size={35} borderRadius={100} source={{
                    uri: props.imgsrc
                }} alt="Alternate Text" />}
                {props.imgIcon}
                <VStack p={3}>
                    <HStack w={'full'}>
                        <Box w={'4/5'} >
                        <VStack style={{justifyContent: 'space-between'}} >
                            <TouchableOpacity onPress={props.onPress}>
                            {props.title && <Box _text={{ color: '#ffffff', fontWeight: 'bold' }}>{props.title}</Box>}
                            {props.subtitle && <Box>
                                <Text style={{ color: '#ffffff' }}>{props.subtitle}</Text>
                            </Box>}
                            </TouchableOpacity>
                        </VStack>
                        </Box>
                        {props.icon && 
                        <Box pt={2} style={{position: 'absolute', right: 0}}>
                            {props.icon}
                        </Box>}
                    </HStack>
                    
                </VStack>
                
            </HStack></>)
}

export default ListItem