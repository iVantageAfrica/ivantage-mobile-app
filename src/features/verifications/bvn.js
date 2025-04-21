import React, { useState } from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, HStack, Button, Heading, Image, Text, Input, FormControl, ScrollView, WarningOutlineIcon, Center } from "native-base";
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import { WebView } from 'react-native-webview';
import { useAuthentication } from '../../queries/useAuthentication';
import { getDeviceId } from '../../common/device';
import { useUser } from '../../context/usercontext';

const goHome = (navigation) => {
    navigation.reset({
        index: 0,
        routes: [{ name: 'AppHome' }],
    });
}

const BVNValidationScreen = ({ navigation, route }) => {
    const [showNavigationWindow, setShowNavigationWindow] = useState(false)
    const [confirmingVerification, setConfirmingVerification] = useState(false)
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNIN, setShowNIN] = useState(false);
    const [destination, setDestination] = useState(null);
    const [updateText, setUpdateText] = useState('');
    const [BVN, setBVN] = useState('');
    const [NIN, setNIN] = useState('');
    const { authData, setAuthData } = useUser()
    const { fetchParamData: verifyBVNData } = useAuthentication(
        "verifybvn",
        "post",
        navigation
    );
    const { fetchParamData: submitValidationData } = useAuthentication(
        "updatebvn",
        "post",
        navigation
    );

    let webview = null

    const _callbackView = route.params.callbackView
    const _callbackViewData = route.params.callbackViewData
    const callbackView = _callbackView ? _callbackView : 'Home'

    const checkBVNData = async () => {
        if (!BVN || BVN.trim().length === 0 || BVN.trim().length !== 11) {
            setIsValid(false)
            AlertBox.showError("Invalid BVN entered. Please check and try again.", 'Invalid Entry')
            return
        }
        setUpdateText('')
        const deviceId = await getDeviceId()
        const body = {
            "bvn": BVN,
            "device": deviceId
        }
        setIsLoading(true)
        verifyBVNData({ ...body }).then(res => {
            setIsLoading(false)
            if (!res || !res.data) {
                AlertBox.showError('Unable to complete this process. Please try again later. #D001', 'BVN Validation')
                return
            }
            const t = res.data?.data
            if (!t) {
                AlertBox.showError('Unable to complete this process. Please try again later. #D002', 'BVN Validation')
                return
            }
            if (t.data && t.data.length) {
                delete t.data[0].face_image
            }
            
            if (t.responseCode && t.responseCode === '15') {
                if (!t.url) {
                    AlertBox.showError('Unable to complete this process. Please try again later. #Err-MUL', 'BVN Validation')
                    return
                }
                setDestination(t.url)
                setShowNavigationWindow(true)
            } else if (t.responseCode && t.responseCode === '01') {
                setUpdateText(t.responseText)
                setShowNIN(true)
            } else if (t.responseCode && t.responseCode === '00') {
                setUpdateText('BVN and NIN fetched successfully, please confirm your NIN is correct and then click on Proceed.')
                if (t.data && t.data.length > 0 && t.data[0].NIN.length === 11) {
                    setNIN(t.data[0].NIN)
                } else {
                    setUpdateText('NIN not found, please enter a valid NIN and then click on Proceed')
                }
                setShowNIN(true)
            } else {
                setShowNIN(false)
                setUpdateText(`Unexpected response: ${t.responseCode}`)
                AlertBox.showError('Unable to complete this process. Please try again later. #Err-URC', 'BVN Validation')
                return
            }
        })
    }

    const handleNIBSSCallback = async () => {
        if (!BVN || BVN.trim().length === 0 || !NIN || NIN.trim().length === 0) {
            setIsValid(false)
            AlertBox.showError("Invalid BVN or NIN number. Please check and try again.", 'Invalid Entry')
            return
        }
        if (BVN.trim().length !== 11 || NIN.trim().length !== 11) {
            setIsValid(false)
            AlertBox.showError("Invalid BVN or NIN number. Please check and try again.", 'Invalid Entry')
            return
        }
        setIsValid(true)
        setIsLoading(true)
        const body = {
            "bvn": BVN,
            "nin": NIN
        }
        setUpdateText('Saving data...')
        submitValidationData({ ...body }).then(res => {
            setIsLoading(false)
            setUpdateText('')
            if (!res || !res.data) {
                AlertBox.showError('Unable to complete this process. Please try again later. Error-NBV1', 'BVN Validation')
                return
            }
            const t = res.data?.data
            if (!t) {
                AlertBox.showError('Unable to complete this process. Please try again later. Error-NBV2', 'BVN Validation')
                return
            }
            if (t.responseCode === '00') {
                AlertBox.showSuccess(t.responseText)
                authData.user.bvnVerified = true
                setAuthData({...authData})
                goHome(navigation)
            } else if (t.responseCode === '01') {
                AlertBox.showSuccess('Thank you for updating your data')
                authData.user.bvnVerified = true
                setAuthData({...authData})
                goHome(navigation)
            } else {
                AlertBox.showError('Unexpected response. Unable to complete this process at this time. Please try again later. Error-NBV3', 'Incomplete Operation')
            }

            return null
        }).catch(e => {
            setIsLoading(false)
            setNIN('')
            setBVN('')
            setShowNIN(false)
            AlertBox.showErrorEx(e)
            return null
        })
    }

    const screenChange = (state) => {
        if (state.url.indexOf('BVNVAL/AuthConfirm') != -1) {
            setConfirmingVerification(true)
            setShowNavigationWindow(false)
            checkBVNData()
            return
        }
    }

    if (!showNavigationWindow && confirmingVerification) {
        return <Loader />
    }

    if (showNavigationWindow && !confirmingVerification) {
        return (
            <View style={{ ...styles.container, flex: 1, marginTop: 60 }}>
                <WebView
                    ref={ref => (webview = ref)}
                    source={{ uri: destination }}
                    startInLoadingState={true}
                    renderLoading={() => isLoading ? <Loader style={{ flex: 1 }} /> : null}
                    onNavigationStateChange={screenChange}
                />
            </View>)
    }

    return (
        <VStack safeArea style={styles.container}>
            <Box>
                <Box mt={10} ml={5} mr={10}>
                    <Heading size="xl" fontWeight="800" color="#ffffff" >
                        BVN & NIN Verification
                    </Heading>
                </Box>
            </Box>
            <View>
                <Box p={5}>
                    <FormControl>
                        <FormControl.Label _text={{
                            color: "#ffffff",
                            fontWeight: "medium",
                            fontSize: "sm"
                        }} > BVN</FormControl.Label>
                        <Input
                            onChangeText={text => {
                                if (isNaN(text)) {
                                    return
                                }
                                setBVN(text)
                                setShowNIN(false)
                                setNIN('')
                            }}
                            keyboardType='number-pad'
                            inputMode='numeric'
                            value={BVN}
                            style={Shared.TextInput.default}
                            variant={'rounded'} />
                        {!isValid && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                            BVN cannot be empty.
                        </FormControl.ErrorMessage>}
                    </FormControl>
                </Box>
                {showNIN && <Box pr={5} pl={5}>
                    <FormControl>
                        <FormControl.Label _text={{
                            color: "#ffffff",
                            fontWeight: "medium",
                            fontSize: "sm"
                        }} > NIN </FormControl.Label>
                        <Input
                            onChangeText={text => {
                                if (isNaN(text)) {
                                    return
                                }
                                setNIN(text)
                            }}
                            keyboardType='number-pad'
                            inputMode='numeric'
                            value={NIN}
                            style={Shared.TextInput.default}
                            variant={'rounded'} />
                        {!isValid && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                            NIN cannot be empty.
                        </FormControl.ErrorMessage>}
                    </FormControl>
                </Box>}
                <Box p={5}>
                    <Button
                        isLoading={isLoading}
                        isLoadingText='Processing...'
                        onPress={(e) => {
                            if (!showNIN) {
                                checkBVNData()
                            } else {
                                handleNIBSSCallback()
                            }
                        }}
                        mt={5} variant={'solid'} w={"full"} style={{ ...Shared.Button.primary }}
                    >Proceed</Button>
                </Box>
                {updateText && updateText.trim().length > 0 && <Box mt={5}>
                    <VStack p={5}>
                        <Box p={3} bgColor={'orange.100'}>
                            <Center>
                                <Text color={'#000000'} fontSize={16}>{updateText}</Text>
                            </Center>
                        </Box>
                    </VStack>

                </Box>}
            </View>
        </VStack>

    );
};


export default BVNValidationScreen;