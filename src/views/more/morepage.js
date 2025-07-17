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

import MoreItem from '../../components/98item'

import { useUser } from '../../context/usercontext'
import { MSStorage } from '../../common/storage';
import AlertBox from '../../components/alertbox';

const { FingerprintWhite } = Theme.SVG;
const { AccountManager, Transfer, PaymentHistory, Bills, RequestCard } = Theme.SVG; // Import necessary SVG icons

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
        <VStack safeArea style={{...styles.container, backgroundColor: Theme.Colors.colorWhite}}>
            <ScrollView>
            <Box px={2}>
                {/* Changed Heading to My Profile */}
                <Heading mt={5} size="xl" fontWeight="800" color={Theme.Colors.primaryText} >
                    My Profile
                </Heading>
                {/* Styled User Profile Section */}
                <VStack mt={6} mb={4} py={3} px={4} style={{backgroundColor: Theme.Colors.profileBackgroundColor, borderRadius: 10}}>
                    <MoreItem onPress={() => navigation.navigate('more_profile')} 
                    imgIcon={<Image size={50} 
                    borderRadius={100} ml={0} mt={0} 
                    resizeMode="cover" 
                    source={
                        { uri: 'https://wallpaperaccess.com/full/317501.jpg' }} alt={'partial'} />} title={`${authData.user.firstname} ${authData.user.surname}`} subtitle={'Account Details'} icon={<Icon size={5} color={'gray'} as={FontAwesome} name="chevron-right" />} />
                </VStack>

                {/* Added KYC Section */}
                <VStack mt={4} mb={4} py={3} px={4} style={{backgroundColor: Theme.Colors.profileBackgroundColor, borderRadius: 10}}>
                    <HStack alignItems="center" justifyContent="space-between">
                         {/* Placeholder Icon - Replace with actual KYC icon */} 
                        <HStack alignItems="center">
                            <Icon size={7} color={Theme.Colors.primaryText} as={FontAwesome} name="shield" />
                            <Text ml={3} fontSize="md" fontWeight="medium" color="#000000">KYC: Level 1</Text>
                        </HStack>
                        <Button size="sm" variant="outline" style={{borderColor: Theme.Colors.primaryText}} _text={{color: Theme.Colors.primaryText}}>Upgrade</Button>
                    </HStack>
                </VStack>

                {/* Added Account Heading */}
                <Box mt={6} mb={3}>
                    <Text fontSize="lg" fontWeight="bold" color="gray">Account</Text>
                </Box>

                {/* Styled Account Menu Items Section */}
                <VStack py={2} px={2} style={{backgroundColor: Theme.Colors.profileBackgroundColor, borderRadius: 10}}>
                     {/* Reset Transaction PIN */}
                    <MoreItem onPress={() => navigation.navigate('TransactionPINScreen')}
                     imgIcon={<Image mb={0} mt={0} ml={0} width={25} resizeMode="contain" 
                     source={Theme.Icons.change_pin} alt={'partial'} />} icon={<Icon size={5} 
                     color={'gray'} as={FontAwesome} name="chevron-right" />} title={'Reset Transaction PIN'} 
                     titleStyle={{fontSize: 15, fontWeight: 'normal', color: '#000000'}} />
                    {/* Divider */}
                    <Box borderBottomWidth={1} borderBottomColor="gray.200" my={2} />

                     {/* Transaction Limit */}
                    <MoreItem onPress={() => navigation.navigate('more_transfer_limit')} imgIcon={<Icon size={6} color={Theme.Colors.primaryText} as={FontAwesome} name="line-chart" />} icon={<Icon size={5} color={'gray'} as={FontAwesome} name="chevron-right" />} title={'Transaction Limit'} titleStyle={{fontSize: 15, fontWeight: 'normal', color: '#000000'}} />
                     {/* Divider */}
                    <Box borderBottomWidth={1} borderBottomColor="gray.200" my={2} />

                    {/* Refer & Earn - Placeholder Icon */} 
                    <MoreItem onPress={() => navigation.navigate('affiliate.onboarding')} imgIcon={<Icon size={6} color={Theme.Colors.primaryText} as={FontAwesome} name="send" />} icon={<Icon size={5} color={'gray'} as={FontAwesome} name="chevron-right" />} title={'Refer & Earn'} titleStyle={{fontSize: 15, fontWeight: 'normal', color: '#000000'}} />
                     {/* Divider */}
                    <Box borderBottomWidth={1} borderBottomColor="gray.200" my={2} />

                    {/* Request Card */}
                    <MoreItem onPress={() => navigation.navigate('CardRequestScreen')} imgIcon={<Icon size={6} color={Theme.Colors.primaryText} as={FontAwesome} name="credit-card" />} icon={<Icon size={5} color={'gray'} as={FontAwesome} name="chevron-right" />} title={'Request Card'} titleStyle={{fontSize: 15, fontWeight: 'normal', color: '#000000'}} />

                </VStack>

                 {/* Biometric Authentication Section (kept for now, outside styled boxes) */}
                {hashardware && !hardwareSetup && 
                <Box px={2} mt={5} mb={5} style={{padding: 5}}>
                    <Text color={'gray'}>You have not configured any Biometric authentication method on this device. Please proceed to device settings to do so.</Text>
                    </Box>}
                {hashardware && 
                <MoreItem onPress={() => {
                    configureBiometricAuth(!enableBiometrics)
                }} imgIcon={<FingerprintWhite height={30} width={30} margin={15} marginLeft={25} />} icon={<Icon size={7} color={enableBiometrics ? '#ff0000' : Theme.Colors.primaryText} as={FontAwesome} name={enableBiometrics ? 'lock' : 'unlock'} />} title={enableBiometrics ? 'Disable Biometric Authentication' : 'Enable Biometric Authentication'} titleStyle={{color: Theme.Colors.colorWhite}} />
                }

                {/* Contact Support and Build Version (kept for now) */}
                <Box mt={10} mb={20} px={2}>
                    <Link isUnderlined={false} href='tel:01-2716125' mt="1">
                        <HStack space={3}>
                            <Icon size={5} color={Theme.Colors.colorWhite} as={FontAwesome} name="phone" />
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: Theme.CustomTheme['color-active-button']
                            }}>Contact Support on 01-2716125</Text>
                        </HStack>
                    </Link>
                </Box>
                <VStack>
                    <Box px={2} mb={10}>
                        <Text style={{ color: 'gray', fontSize: 11 }}>
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