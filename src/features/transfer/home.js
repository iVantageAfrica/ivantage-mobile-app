import React from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Center } from "native-base";


const TransferHomeScreen = ({ navigation, route }) => {
   
    return (
        <VStack safeArea style={styles.container}>
           <Box>
                <Box ml={10} mr={10}>
                    <Heading size="2xl" fontWeight="800" color="#ffffff" >
                         Work In Progress
                    </Heading>
                </Box>
            </Box>
            
        </VStack>

    );
};


export default TransferHomeScreen;