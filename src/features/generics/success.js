import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native'
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Center } from "native-base";
import Constants from 'expo-constants';
import AlertBox from '../../components/alertbox';
import { getAppConfig } from '../../common/device';

import Loader from '../../components/loader'

import { useAuthentication } from "../../queries/useAuthentication";

const onGetStarted = (navigation, nextScreen) => {
    navigation.reset({
        index: 0,
        routes: [{ name: nextScreen ? nextScreen : 'LoginScreen' }],
    });
}

const SuccessScreen = ({ navigation, route }) => {
    const { fetchData: addNewBeneficiary } = useAuthentication('addbeneficiaries', 'post', navigation);
    const [isLoading, setLoading] = useState(false)
    const { context, message, title, data, buttonText = null } = (route && route.params) ?? { context: null, message: '', title: '', data: {} }
    const bankName = !data || !data.bankName || data.bankName.length === 0 ? getAppConfig().client_display_name : data.bankName
   
    const addNewBeneficiaryReq = () => {
        const beneficiary = data.transactionMetadata
        if(!beneficiary) {
            AlertBox.showError('Unable to add this account to your beneficiary list.', 'Incomplete Data');
            return
        }
        setLoading(true)
        const payload = {
            name: beneficiary.accountName,
            bankName: bankName,
            bankCode: beneficiary.bankCode,
            accountName: beneficiary.accountName,
            accountNumber: beneficiary.accountNumber,
        }
        if( data.isNIP) {
            payload.lookup_session_id = beneficiary.lookup_session_id
            payload.lookup_metadata = beneficiary.lookup_metadata
        }
        addNewBeneficiary({
            ...payload
        }).then(res => {
            setLoading(false)
            if (res && res.data && res.data.success) {
                AlertBox.showSuccess('New Beneficiary add successfully.')
                if(context && context.nextPage) {
                    onGetStarted(navigation, context.nextPage)
                }else {
                    onGetStarted(navigation)
                }
                return
            }
            AlertBox.showErrorEx(res)
        })
    }

    if(isLoading) {
        return <Loader />
    }

    return (
        <VStack safeArea style={styles.container}>
            <Box justifyContent="center" alignItems="center">
                <Image height="xs" resizeMode="contain" alt={'Welcome'} source={Theme.Images.success_icon} />
            </Box>
            <Box>
                <Box ml={10} mr={10}>
                    {title != '' && <Heading mt={5} textAlign={'center'} size="xl" fontWeight="600" color="#ffffff" >
                        {title}
                    </Heading>}
                    <Box mt={10}>
                        <Text fontSize={16} textAlign={'center'} color={'#ffffff'}>{message}</Text>
                    </Box>
                </Box>
            </Box>
            {data && data.transactionMetadata.is_new && <Box mt={5}>
                <Center>
                    <Button colorScheme={'orange'} variant={'ghost'} w={150} size={'md'} style={Shared.Button.default} onPress={() => {
                        addNewBeneficiaryReq()
                    }}>Add As Beneficiary</Button>
                </Center>
            </Box>}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <Box>
                    <HStack marginBottom={10} alignItems={'center'} justifyContent={'center'} space={5}>
                        {!context || !context.nextPage && (<Box><Button variant={'solid'} w={'full'} size={'md'} style={Shared.Button.primary} onPress={() => onGetStarted(navigation)}>{buttonText ? buttonText : 'Done'}</Button></Box>)}
                        {context && context.nextPage && (<Box><Button variant={'solid'} w={'full'} size={'md'} style={Shared.Button.primary} onPress={() => onGetStarted(navigation, context.nextPage)}>{buttonText ? buttonText : 'Done'}</Button></Box>)}
                        {/* <Box><Button variant={'solid'} w={150} size={'md'} style={Shared.Button.default} onPress={() => onSkip(navigation)}>Skip</Button></Box> */}
                    </HStack>
                </Box>
            </View>
        </VStack>

    );
};


export default SuccessScreen;