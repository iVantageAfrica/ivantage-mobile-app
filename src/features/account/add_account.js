import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'
import { useValidation } from 'react-native-form-validator';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import { Box, VStack, Center, FormControl, WarningOutlineIcon, Input, Button, Heading, ScrollView, Text } from "native-base";
import AlertBox from '../../components/alertbox';
import OTPInput from '../../components/otp';



const onSuccessful = (navigation, data) => {
    navigation.navigate('Home', { params: { ...data } })
}

const AddAccountScreen = ({ navigation, route }) => {
    const { fetchData } = useAuthentication('onboard_customer_account', 'post', navigation);
    const { fetchData: getUserAuth } = useAuthentication('user', 'get', navigation);
    const { fetchData: confirmAccountOTP } = useAuthentication('account_otp', 'post', navigation);

    let { accountType, accountTypeLabel, authData } = (route && route.params) ?? { accountType: null, accountTypeLabel: '', authData: null }
    const [accountNo, setAccountNo] = useState('')
    const [otp, setOTP] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [showOtpScreen, setShowOtpScreen] = useState(false)
    const [linkData, setLinkingData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)



    const { validate, isFieldInError, getErrorsInField } =
        useValidation({
            state: { accountNo },
        });


    useFocusEffect(useCallback(() => {
        if (!accountType) {
            setHasError(true)
            return
        }
        const valid = validate({
            accountNo: { required: true, minlength: 10, maxlength: 10 }
        })
        setIsValid(valid);
    }, [accountNo]))

    const createAccount = () => {
        if (!accountNo) {
            AlertBox.showError('Account Number not filled correctly.')
            return;
        }
        setIsLoading(true)
        fetchData({
            accountNo,
            accountType
        }).then(async (res) => {
            setIsLoading(false)
            if (res.data && res.data.success) {
                setLinkingData(res.data.data)
                setOTP('')
                setShowOtpScreen(true)
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err)
        })
    }

    const verifyAccountOTP = () => {
        if (!linkData) { return }
        setIsLoading(true)
        confirmAccountOTP({
            identifier: linkData.objectId,
            verificationCode: otp
        }).then(res => {
            setIsLoading(false)
            if (res.data && res.data.success) {
                AlertBox.showSuccess(res.data.message)
                onSuccessful(navigation, res.data.data)
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err)
        })
    }


    return (
        <>
            <ScrollView>
                <VStack  >
                    <Center h={'full'} mt={1} w="100%">
                        {hasError && <Box >
                            <Center>
                                <Heading style={{ color: '#ffffff', fontSize: 24 }}>Invalid Form</Heading>
                                <Box px={10} mt={10}>
                                    <Text style={{ color: '#ffffff', fontSize: 14 }}>
                                        Unable to determine the type of account you wish to create.
                                    </Text>
                                    <Text style={{ color: '#ffffff', fontSize: 14 }}>
                                        Please close this application and try again.
                                    </Text>
                                </Box>
                            </Center>
                        </Box>}
                        {!hasError && <Box p="2" py="4" w="full" px={5}>
                            <Heading size="xl" fontWeight="800" color="#ffffff" >
                                Add Existing {accountTypeLabel} Account
                            </Heading>
                            {!showOtpScreen && <VStack mt="3">
                                <FormControl isInvalid isRequired>
                                    <FormControl.Label type={'Email'} _text={{
                                        color: "#ffffff",
                                        fontWeight: "medium",
                                        fontSize: "sm"
                                    }}>Account Number</FormControl.Label>
                                    <Input
                                        keyboardType={'numeric'}
                                        onChangeText={text => {
                                            setAccountNo(text)
                                        }} value={accountNo} style={Shared.TextInput.default} variant={'rounded'} />
                                    {isFieldInError('accountNo') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                        Account Number not valid.
                                    </FormControl.ErrorMessage>}

                                </FormControl>

                            </VStack>}
                            {showOtpScreen && <VStack mt="3">
                                <FormControl isInvalid isRequired>
                                    <FormControl.Label type={'Email'} _text={{
                                        color: "#ffffff",
                                        fontWeight: "medium",
                                        fontSize: "sm"
                                    }}>Account Number</FormControl.Label>
                                    <OTPInput
                                        fieldDesc={'An OTP has been sent to the email registered with this account number. Enter the OTP in the fields below.'}
                                        pinLen={6}
                                        onTextComplete={(otp) => {
                                            setOTP(otp)
                                        }}
                                    />

                                </FormControl>

                            </VStack>}
                        </Box>}
                    </Center>
                </VStack></ScrollView>
            <Box mb={5} px={3}>
                {!showOtpScreen && <Button
                    isLoadingText='Processing...'
                    isLoading={isLoading}
                    isDisabled={!isValid}
                    onPress={() => createAccount()}
                    mt={5} variant={'solid'} w={"full"} size={'lg'} style={Shared.Button.primary} >
                    Link Account
                </Button>}
                {showOtpScreen && linkData && <Button
                    isLoadingText='Processing...'
                    isLoading={isLoading}
                    isDisabled={!isValid}
                    onPress={() => verifyAccountOTP()}
                    mt={5} variant={'solid'} w={"full"} size={'lg'} style={Shared.Button.primary} >
                    Proceed
                </Button>}
            </Box>
        </>
    )
}

export default AddAccountScreen;