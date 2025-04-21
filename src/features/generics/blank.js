import React from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Center } from "native-base";
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'

const onGetStarted = (navigation) => {
    navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
}

const BlankScreen = ({ navigation, route }) => {
   
    return (
        <VStack safeArea style={styles.container}>
           <Box>
                <Box ml={10} mr={10}>
                    <Heading size="2xl" fontWeight="800" color="#ffffff" >
                         Work In Progress
                    </Heading>
                </Box>
            </Box>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <Box>
                    <HStack marginBottom={5} alignItems={'center'} justifyContent={'center'} space={5}>
                        <Box><Button variant={'solid'} w={150} size={'md'} style={Shared.Button.primary} onPress={() => onGetStarted(navigation)}>Understood</Button></Box>
                    </HStack>
                </Box>
            </View>
        </VStack>

    );
};


export default BlankScreen;