import React, {useState} from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';

import AlertBox from '../../components/alertbox';

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox } from "native-base";
import { useAuthentication } from "../../queries/useAuthentication";
import OTPInput from '../../components/otp'
import { useUser } from '../../context/usercontext'

const TransactionPINScreen = ({ navigation, route }) => {
    const { fetchData: requestTransactionPinReset } = useAuthentication('transaction_pin', 'post', navigation);
    const { fetchData: completeTransactionPinReset } = useAuthentication('complete_transaction_pin', 'post', navigation);

    //complete_transaction_pin
    const { authData, setAuthData } = useUser();
    const [isLoading, setIsLoading] = useState(false)
    const [isPinSet, setIsPinSet] = useState(false)
    const [showTranPin, setShowTransPin] = useState(false)
    const [resetRequested, setResetRequested] = useState(false)
    const [resetRequestData, setResetRequestData] = useState(null)

    const [otp, setOTP] = useState(null)
    const [pin, setPIN] = useState(null)

    const makeResetTransactionPINRequest = () => {
        setIsLoading(true)
        requestTransactionPinReset({}).then(res => {
            setIsLoading(false)
            if(res && res.data && res.data.success) {
                setResetRequested(true)
                setResetRequestData(res.data.data)
                AlertBox.showSuccess(res.data.message)
            }else {
                AlertBox.showErrorEx(res)
            }
        }).catch(e => {
            setIsLoading(false)
            AlertBox.showErrorEx(e)
            return null
        })
    }

    const completeResetTransactionPINRequest = () => {
        if(!resetRequestData || !resetRequestData.request_ref) {
            AlertBox.showError('Unable to proceed with this request. Restart this process again.')
            return
        }
        setIsLoading(true)
        completeTransactionPinReset({
            identifier: resetRequestData.request_ref,
            verificationCode: otp,
            pin
        }).then(res => {
            setIsLoading(false)
            if(res && res.data && res.data.success) {
                setResetRequested(true)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'SuccessScreen', params: {context: {nextPage: 'Home'}, 
                    title: 'Completed', message: res.data.message} }],
                  });
                return 
            }else {
                AlertBox.showErrorEx(res)
            }
        }).catch(e => {
            setIsLoading(false)
            AlertBox.showErrorEx(e)
            return null
        })
    }

   
    return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
        <ScrollView >
        <VStack  >
           <Box px={3} >
                <Box ml={3}>
                    <Heading mt={10} size="xl" fontWeight="800" color="#ffffff" >
                         Transaction PIN
                    </Heading>
                </Box>
                {!resetRequested && <Box mt={5} p={3}>
                    <VStack>
                        <Box mb={5}>
                            <VStack space={5}>
                            <Text style={styles.pageText}>You may request a PIN reset by clicking the button below.</Text>
                            <Text style={styles.pageText}>An email will be sent to you, please follow the instruction in the email.</Text>
                            </VStack>
                        </Box>
                        <Box>
                            <Button  
                            isLoading={isLoading}
                            isLoadingText={'Sending Request...'}
                            variant={'solid'} w={'full'} size={'lg'} style={Shared.Button.primary} onPress={() => makeResetTransactionPINRequest()}>Reset Transaction PIN</Button>
                        </Box>
                    </VStack>
                </Box>}
                {resetRequested && <Box mt={5} p={3}>
                    <VStack>
                        <Box mb={5}>
                            <Text style={styles.pageText}>Please punch in the verfication code sent to your email in the fields below.</Text>
                        </Box>
                        <Box mt={4}>
                            <OTPInput fieldDesc={'Enter the verification code sent to your email.'} pinLen={6} onTextComplete={(text) => {
                            setShowTransPin(true)
                            setOTP(text)
                        }} />
                        </Box>
                        {showTranPin && otp && <Box mt={4}>
                            <Text  style={styles.pageText}>Enter your new PIN</Text>
                            <OTPInput pinLen={4} onTextComplete={(text) => {
                            setIsPinSet(true)
                            setPIN(text)
                        }} />
                        </Box>}
                        <Box mt={10}>
                            <Button 
                            isLoading={isLoading}
                            isLoadingText={'Processing Request...'}
                            onPress={() => completeResetTransactionPINRequest()}
                            variant={'solid'} w={'full'} size={'lg'} style={Shared.Button.primary} isDisabled={!isPinSet || !pin || !otp || !resetRequestData}>Change Transaction PIN</Button>
                        </Box>
                    </VStack>
                </Box>}
                
            </Box>
        </VStack>
        </ScrollView></KeyboardAvoidingView>
    );
};


export default TransactionPINScreen;