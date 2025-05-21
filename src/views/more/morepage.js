import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { getAppMantifest } from '../../common/device';
import * as LocalAuthentication from 'expo-local-authentication';

import { Icon, ScrollView } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox } from "native-base";

import MoreItem from '../../components/moreitem'

import { useUser } from '../../context/usercontext'
import { MSStorage } from '../../common/storage';
import AlertBox from '../../components/alertbox';

const { FingerprintWhite } = Theme.SVG

const MoreScreen = ({ navigation, route }) => {
    const sdkVersion = getAppMantifest().sdkVersion
    const version = getAppMantifest().version
    const { authData } = useUser();
    const [enableBiometrics, setEnableBiometrics] = useState(false)
    const [hardwareSetup, setIsHardwareSetup] = useState(false)
    const [hashardware, setHasHardware] = useState(false)

    useEffect(() => {
        (async () => {
            await getHardwareSetupState()
            await getEnableBiometricState()
        })()
    }, [])


    const getEnableBiometricState = async () => {
        const isEnable = await MSStorage.getItem('enable_biometric')
        const hasHardware = await LocalAuthentication.hasHardwareAsync()

        if (!hasHardware) {
            setEnableBiometrics(false)
            return
        }
        setEnableBiometrics(isEnable)
    }

    const configureBiometricAuth = async (state) => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Enable Biometric Authentication on this device?",
            cancelLabel: "Not Now"
        })
        if(result && result.success) {
            setEnableBiometrics(state)
            if (!state) {
                await MSStorage.deleteItem('enable_biometric')
            }else {
                await MSStorage.setItem('enable_biometric', true)
                AlertBox.showSuccess("Biometric Authentication setup successfully. You are required to login again for complete setup", "Biometric Setup", () => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'LoginScreen'}],
                      });
                });
                
            }
        }
    }

    const getHardwareSetupState = async () => {
        const hardwareState = await LocalAuthentication.isEnrolledAsync()
        const hasHardware = await LocalAuthentication.hasHardwareAsync()
        setHasHardware(hasHardware)
        setIsHardwareSetup(hardwareState)
    }


    return (
        <VStack safeArea style={styles.container}>
            <ScrollView>
            <Box>
                <Box ml={3}>
                    <Heading mt={5} size="xl" fontWeight="800" color="#ffffff" >
                        More
                    </Heading>
                </Box>
                <VStack mt={4} mb={4}>
                    <MoreItem onPress={() => navigation.navigate('more_profile')} imgIcon={<Image size={50} borderRadius={100} ml={3} mt={1} resizeMode="cover" source={{ uri: 'https://wallpaperaccess.com/full/317501.jpg' }} alt={'partial'} />} title={`${authData.user.firstname} ${authData.user.surname}`} subtitle={'Account Details'} />
                </VStack>
                <VStack>
                    {/* <MoreItem imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.change_password} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Change Password'} /> */}
                    <MoreItem onPress={() => navigation.navigate('TransactionPINScreen')} imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.change_pin} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Change Transaction PIN'} />
                    {/* <MoreItem imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.auto_save} alt={'partial'} />} icon={<Checkbox isChecked colorScheme="orange" accessibilityLabel={'On'} />} title={'Auto Save'} /> */}
                    <MoreItem onPress={() => navigation.navigate('more_transfer_limit')} imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.faq} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Transfer Limit'} />
                    <MoreItem onPress={() => navigation.navigate('more_faq')} imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.faq} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'FAQ'} />
                    <MoreItem onPress={() => navigation.navigate('CardRequestScreen')} imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.faq} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Request Card'} />
                    <MoreItem onPress={() => navigation.navigate('AccountManagerScreen')} imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.faq} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Account Manager'} />

                    <MoreItem onPress={() => navigation.navigate('FeedbackScreen')} imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.faq} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Enquiries & Complaints'} />
                    {hashardware && !hardwareSetup && 
                    <Box px={5} mt={2} mb={5} style={{padding: 5}}>
                        <Text color={'#ffffff'}>You have not configured any Biometric authentication method on this device. Please proceed to device settings to do so.</Text>
                        </Box>}
                    {hashardware && 
                    <MoreItem onPress={() => {
                        configureBiometricAuth(!enableBiometrics)
                    }} imgIcon={<FingerprintWhite height={30} width={30} margin={15} marginLeft={25} />} icon={<Icon size={7} color={enableBiometrics ? '#ff0000' : '#00ff00'} as={FontAwesome} name={enableBiometrics ? 'lock' : 'unlock'} />} title={enableBiometrics ? 'Disable Biometric Authentication' : 'Enable Biometric Authentication'} />
                    }
                    <Box mt={10} mb={20} px={5}>
                        <Link isUnderlined={false} href='tel:01-2716125' mt="1">
                            <HStack space={3}>
                                <Icon size={5} color={'#ffffff'} as={FontAwesome} name="phone" />
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                    color: Theme.CustomTheme['color-active-button']
                                }}>Contact Support on 01-2716125</Text>
                            </HStack>
                        </Link>
                    </Box>
                </VStack>
                <VStack>
                    <Box px={5}>
                        <Text style={{ color: '#ffffff', fontSize: 11 }}>
                            Build Version {version}-{sdkVersion}
                        </Text>
                    </Box>
                </VStack>
            </Box>
            </ScrollView>
        </VStack>

    );
};


export default MoreScreen;