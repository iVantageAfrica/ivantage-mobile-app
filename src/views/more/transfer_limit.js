import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';

import AlertBox from '../../components/alertbox';

import { FormControl, Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox } from "native-base";
import { useAuthentication } from "../../queries/useAuthentication";
import OTPInput from '../../components/otp'
import { useUser } from '../../context/usercontext'
import Loader from '../../components/loader';
import CurrencyInput from 'react-native-currency-input';

const TransferLimitScreen = ({ navigation, route }) => {
    const { fetchData: updateTransferLimit } = useAuthentication('transfer_limit', 'post', navigation);
    const { fetchData: getTransferLimit } = useAuthentication('transfer_limit', 'get', navigation);

    //complete_transaction_pin
    const { authData, setAuthData } = useUser();
    const [isLoading, setIsLoading] = useState(false)
    const [isPinSet, setIsPinSet] = useState(false)
    const [showTranPin, setShowTransPin] = useState(false)
    const [transferLimitData, setTransferLimitData] = useState(0)

    const [otp, setOTP] = useState(null)
    const [pin, setPIN] = useState(null)

    const getTransferLimitRequest = () => {
        setIsLoading(true)
        getTransferLimit({}).then(res => {
            setIsLoading(false)
            console.log(res.data)
            if (res && res.data && res.data.success) {
                setTransferLimitData(Number(res.data.data?.transaction_limit))
                // AlertBox.showSuccess(res.data.message)
            } else {
                AlertBox.showErrorEx(res)
            }
        }).catch(e => {
            setIsLoading(false)
            AlertBox.showErrorEx(e)
            return null
        })
    }

    const updateTransferLimitRequest = () => {
        if (!transferLimitData || transferLimitData <= 0) {
            AlertBox.showError('Transfer limit must be a valid number above zero.')
            return
        }
        setIsLoading(true)
        updateTransferLimit({
            transfer_limit: Number(transferLimitData),
            pin
        }).then(res => {
            setIsLoading(false)
            console.log(res)
            if (res && res.data && res.data.success) {
                // setResetRequested(true)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'SuccessScreen', params: {context: {nextPage: 'Home'}, 
                    title: 'Completed', message: "Daily transfer limit set successfully"} }],
                  });
                return
            } else {
                setTransferLimitData(0)
                AlertBox.showErrorEx(res)
            }
        }).catch(e => {
            setIsLoading(false)
            setTransferLimitData(0)
            AlertBox.showErrorEx(e)
            return null
        })
    }

    useEffect(() => {
        getTransferLimitRequest()
    }, [])

    if (isLoading) {
        return <Loader />
    }

    return (
        // <KeyboardAvoidingView behavior='padding' style={styles.container}>
            <ScrollView  style={styles.container} >
                <VStack  >
                    <Box px={3} >
                        <Box ml={3}>
                            <Heading mt={20} size="xl" fontWeight="800" color={Theme.Colors.colorTextBold} >
                                Transfer Limit
                            </Heading>
                        </Box>
                        <Box mt={5} p={3}>
                            <VStack>
                                <Box mb={5}>
                                    <VStack space={5}>
                                        <Text style={styles.pageText}>Transfer limit set a control of how much transfer can be made from your account on a daily basis.</Text>
                                    </VStack>
                                </Box>
                                <Box mb={10}>
                                    <FormControl isRequired>
                                        <FormControl.Label
                                            type={"Email"}
                                            _text={{
                                                color: "#14BAB0",
                                                fontWeight: "medium",
                                                fontSize: "sm",
                                            }}
                                        >
                                            Daily Transfer Limit
                                        </FormControl.Label>
                                        <CurrencyInput
                                            precision={0}
                                            minValue={0}
                                            delimiter={","}
                                            separator={"."}
                                            style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                                            placeholder={"Enter Amount"}
                                            onChangeValue={(t) => {
                                                setTransferLimitData(t);
                                            }}
                                            variant={"rounded"}
                                            value={transferLimitData}
                                            keyboardType={"numeric"}
                                        />
                                    </FormControl>
                                </Box>
                                <Box>
                                    {!showTranPin && <Button
                                    isDisabled={transferLimitData <= 0}
                                        isLoading={isLoading}
                                        isLoadingText={'Sending Request...'}
                                        variant={'solid'} w={'full'} size={'lg'} style={Shared.Button.primary} onPress={() => setShowTransPin(true)}>Continue</Button>}
                                </Box>
                            </VStack>
                        </Box>
                        {showTranPin && <Box mt={0} p={3}>
                            <VStack>
                                <Box mt={0}>
                                    <Text style={styles.pageText}>Enter your new PIN</Text>
                                    <OTPInput pinLen={4} onTextComplete={(text) => {
                                        setIsPinSet(true)
                                        setPIN(text)
                                    }} />
                                </Box>
                                <Box mt={10}>
                                    <Button
                                        isLoading={isLoading}
                                        isLoadingText={'Processing Request...'}
                                        onPress={() => updateTransferLimitRequest()}
                                        variant={'solid'} w={'full'} size={'lg'} style={Shared.Button.primary} isDisabled={!isPinSet || !pin || !transferLimitData}>Change Daily Transfer Limit</Button>
                                </Box>
                            </VStack>
                        </Box>}

                    </Box>
                </VStack>
            </ScrollView>
            // </KeyboardAvoidingView>
    );
};


export default TransferLimitScreen;