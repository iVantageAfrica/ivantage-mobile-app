import React, { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from "../../components/alertbox";
import Loader from '../../components/loader'
import TransactionSummary from '../partials/transaction_summary';
import { Box, VStack, HStack, Center, FormControl, Link, WarningOutlineIcon, Input, Button, Heading, Image, Text, KeyboardAvoidingView, ScrollView } from "native-base";
import utils from '../../common/utils';



const onOTPSuccessful = (navigation, data) => {
    navigation.reset({
        index: 0,
        routes: [{
            name: 'SuccessScreen', params: {
                context: { nextPage: 'Home' },
                title: 'Transaction Successful', message: 'Transaction completed successfully.',
                data
            }
        }],
    });
}

const TransferOTPScreen = ({ navigation, route }) => {
    const { fetchData: verifyAndCompleteTransaction } = useAuthentication('transactionotpverification', 'post', navigation);
    const transactionDetail = route.params

    const ref_input_0 = useRef()
    const ref_input_1 = useRef()
    const ref_input_2 = useRef()
    const ref_input_3 = useRef()

    const [otp, setOTP] = useState(['', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [isResend, setResend] = useState(false)
    const [isEnableBtn, setEnableBtn] = useState(false)

    const validateOTP = () => {
        if (otp.length != 4) {
            return
        }
        setIsLoading(true)
        verifyAndCompleteTransaction({
            identifier: transactionDetail.objectId,
            verificationCode: otp.join('')
        }).then(async (res) => {
            if (res.data && res.data.success && res.data.data) {
                AlertBox.showSuccess(res.data.message, 'Transaction Complete.');
                onOTPSuccessful(navigation, transactionDetail)
                return
            } else {
                AlertBox.showErrorEx(res)
            }
            setIsLoading(false)
            resetOTP()
            navigation.goBack()
        }).catch(err => {
            setIsLoading(false)
            resetOTP()
            AlertBox.showErrorEx(err)
        })
    }

    const resetOTP = () => {
        setOTP(['', '', '', ''])
    }

    const getTransaction = () => {
        return {
            accountNumber: transactionDetail.primaryDestinationAccount,
            recipientsName: transactionDetail.transactionMetadata? transactionDetail.transactionMetadata.accountName:'',
            recipientsBankName: transactionDetail.transactionMetadata ? transactionDetail.transactionMetadata.bankName:'',
            amount: transactionDetail.totalCredit,
            transactionNarration: utils.removeSpecialCharacters(transactionDetail.narration),
        }
    }

    const pushInOTP = (text, index) => {
        otp[index] = text
        setOTP([...otp])
        const otpLen = otp.join('').trim().length
        if (otpLen == 4) {
            setEnableBtn(true)
        } else {
            setEnableBtn(false)
        }
        const gRef = getRef(index)
        if (gRef && text.trim().length > 0) {
            if (index < otp.length - 1 && otp[index + 1] == '') {
                gRef.current.focus()
            } else if (index == otp.length - 1 && otp[0] == '') {
                gRef.current.focus()
            }
        }
    }

    const getRef = (currentIndex) => {
        if (currentIndex == 0) {
            return ref_input_1
        }
        if (currentIndex == 1) {
            return ref_input_2
        }
        if (currentIndex == 2) {
            return ref_input_3
        }
        if (currentIndex == 3) {
            return ref_input_0
        }
        return null
    }



    return (
            <>
            <ScrollView h={'full'}  >
                <Box p={5} w="full" >
                    <Box mb={10} >
                        <TransactionSummary transaction={getTransaction()} is_detail={false} />
                    </Box>
                    <Heading size="xl" fontWeight="800" color="#ffffff" >
                        Enter your PIN?
                    </Heading>
                    <Text style={{ color: '#ffffff' }}>Enter your transaction PIN to complete this transaction.</Text>
                    <VStack space={3} mt="5">
                        <FormControl isInvalid>
                            <Center>
                                <HStack space={4}>
                                    <Input ref={ref_input_0} value={otp[0]} onFocus={() => pushInOTP('', 0)} maxLength={1} autoCapitalize={'none'} secureTextEntry={true} type={'password'} keyboardType={'numeric'} onChangeText={(text) => pushInOTP(text, 0)} w={50} textAlign={'center'} caretHidden={true} style={{ ...Shared.TextInput.default, fontWeight: 'bold', fontSize: 40 }} variant={'rounded'} />
                                    <Input ref={ref_input_1} value={otp[1]} onFocus={() => pushInOTP('', 1)} maxLength={1} autoCapitalize={'none'} secureTextEntry={true} type={'password'} keyboardType={'numeric'} onChangeText={(text) => pushInOTP(text, 1)} w={50} textAlign={'center'} caretHidden={true} style={{ ...Shared.TextInput.default, fontWeight: 'bold', fontSize: 40 }} variant={'rounded'} />
                                    <Input ref={ref_input_2} value={otp[2]} onFocus={() => pushInOTP('', 2)} maxLength={1} autoCapitalize={'none'} secureTextEntry={true} type={'password'} keyboardType={'numeric'} onChangeText={(text) => pushInOTP(text, 2)} w={50} textAlign={'center'} caretHidden={true} style={{ ...Shared.TextInput.default, fontWeight: 'bold', fontSize: 40 }} variant={'rounded'} />
                                    <Input ref={ref_input_3} value={otp[3]} onFocus={() => pushInOTP('', 3)} maxLength={1} autoCapitalize={'none'} secureTextEntry={true} type={'password'} keyboardType={'numeric'} onChangeText={(text) => pushInOTP(text, 3)} w={50} textAlign={'center'} caretHidden={true} style={{ ...Shared.TextInput.default, fontWeight: 'bold', fontSize: 40 }} variant={'rounded'} />
                                </HStack>
                            </Center>
                        </FormControl>
                        

                    </VStack>
                </Box>
            </ScrollView>
            <Box px={3}>
            <Button
                mt={5}
                mb={5}
                isLoading={isLoading}
                isLoadingText={'Verifying OTP...'}
                isDisabled={!isEnableBtn}
                onPress={() => { validateOTP() }}
                variant={'solid'} w={"full"} size={'lg'} style={Shared.Button.primary} >
                Validate PIN
            </Button>
            </Box>
            
            {isResend && <Loader />}
            </>
    )
}

export default TransferOTPScreen;