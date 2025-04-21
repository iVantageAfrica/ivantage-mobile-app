import React, {useState, useCallback, useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native'
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Center } from "native-base";
import { useUser } from '../../context/usercontext'
import { MSStorage } from "../../common/storage";
import { getAppConfig } from '../../common/device'

const onSkip = (navigation) => {
    navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
}

const onClearDevice = async(navigation) => {
    await MSStorage.deleteItem('user');
    await MSStorage.deleteItem('token');
    navigation.reset({
        index: 0,
        routes: [{ name: 'SignUpScreen' }],
      });
}

const AccountIntroScreen = ({ navigation }) => {
    const { authData } = useUser();

    // useEffect(()=>{
    //     if(authData === undefined || !authData.user || !authData.user.objectId) {
    //         onClearDevice(navigation)
    //     }
    // }, [])

    // useFocusEffect(useCallback(() => {
        
    // }, []))

    const displayText = getAppConfig().client_account_opening_display_text
    return (
        <VStack style={styles.container}>
            <Box justifyContent="center" alignItems="center">
                <Image height="xl" resizeMode="cover" alt={'Welcome'} source={Theme.Images.accountIntro} />
            </Box>
            <Box>
                <Box ml={10} mr={10}>
                    {authData !== undefined && <Heading size="2xl" fontWeight="800" color="#ffffff" >
                        Hello {authData?? authData.user.firstname}
                    </Heading>}
                    <Box>
                        <Text color={'#ffffff'}>{displayText}</Text>
                    </Box>
                </Box>
            </Box>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <Box>
                    <HStack marginBottom={5} alignItems={'center'} justifyContent={'center'} space={5}>
                        <Box><Button variant={'solid'} w={150} size={'md'} style={Shared.Button.primary} onPress={() => navigation.navigate('CreateAccountScreen', {accountType: 'ivantage'})}>Create Account</Button></Box>
                        <Box><Button variant={'solid'} w={150} size={'md'} style={Shared.Button.default} onPress={() => onSkip(navigation)}>Skip</Button></Box>
                    </HStack>
                    <Box mb={10}>
                        <Center>
                        <Link _text={{
                                fontSize: "sm",
                                fontWeight: "500",
                                color: Theme.CustomTheme['color-active-button']
                            }}  onPress={() => onClearDevice(navigation)} mt="1">
                                Start a fresh registration
            </Link>
                        </Center>
                    
                    </Box>
                </Box>
            </View>
        </VStack>

    );
};


export default AccountIntroScreen;