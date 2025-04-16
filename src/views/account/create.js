import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'
import { Platform, SafeAreaView } from 'react-native';
import { useValidation } from 'react-native-form-validator';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import { Box, VStack, Stack, Radio, Checkbox, HStack, Center, FormControl, Select, WarningOutlineIcon, Input, Button, Heading, ScrollView, Text, KeyboardAvoidingView, View } from "native-base";
import AlertBox from '../../components/alertbox';
import Config from '../../common/config'
import { WebView } from 'react-native-webview';
import Utils from '../../common/utils'
import { useUser } from '../../context/usercontext'
import Loader from '../../components/loader';



const onSuccessful = (navigation, data) => {
    navigation.navigate('AccountDocumentScreen', { params: { ...data } })
}

const CreateAccountScreen = ({ navigation, route }) => {
    const { fetchData } = useAuthentication('bankaccountcreate', 'post', navigation);
    const { fetchData: getUserAuth } = useAuthentication('user', 'get', navigation);
    const { fetchParamData: lookBVNData } = useAuthentication(
        "bvnlookup",
        "post",
        navigation
    );

    let { accountType, accountTypeLabel, authData } = (route && route.params) ?? { accountType: null, accountTypeLabel: '', authData: null }
    const { authData: userInfo, setAuthData } = useUser();
    const monthsWith30Days = ['04', '06', '09', '11']
    const [years, setYears] = useState([])
    const [months, setMonths] = useState([])
    const [day, setDay] = useState([])
    let webview = null
    const detailFilled = userInfo.user.bvn && userInfo.user.dob && userInfo.user.gender ? true : false

    const [selectedYear, setYear] = useState('')
    const [selectedMonth, setMonth] = useState('')
    const [selectedDay, setSelectedDay] = useState('')

    const _parsedDOB = (!authData.user.dob || !authData.user.dob.iso) ? '' : Utils.toYMD(new Date(authData.user.dob.iso))

    const [dateofbirth, setDOB] = useState(_parsedDOB)
    const [gender, setGender] = useState(authData.user.gender ? authData.user.gender : '')
    const [address, setAddress] = useState('')
    const [bvn, setBVN] = useState(authData.user.bvn ? authData.user.bvn : '')
    const [isValid, setIsValid] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [showMainForm, setShowMainForm] = useState(detailFilled)
    const [showNavigationWindow, setShowNavigationWindow] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [bvnVerified, setBVNVerified] = useState(false)
    const [destination, setDestination] = useState(null);



    const { validate, isFieldInError, getErrorsInField } =
        useValidation({
            state: { dateofbirth, gender, address, bvn },
        });


    useFocusEffect(useCallback(() => {
        if (!accountType) {
            setHasError(true)
            return
        }
        const valid = validate({
            dateofbirth: { required: true },
            gender: { required: true },
            address: { required: true },
            bvn: { required: true, minlength: 11, maxlength: 11 },
        })
        setIsValid(valid);
        generateYears()
        generateMonths()
    }, [dateofbirth, gender, address, bvn, showNavigationWindow, verifying]))

    const revalidateUserAuth = async () => {
        await getUserAuth({}).then(res => {
            if (res.data && res.data.success) {
                userInfo.user = res.data.data
                if (userInfo.user.dateOfBirth) {
                    delete userInfo.user.dateOfBirth
                }
                setAuthData({ ...userInfo })
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(e => {
            AlertBox.showErrorEx('Error occurred while validating your session. Please login again.')
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            });
        })
    }

    const checkBVNData = async () => {
        if (!bvn || bvn.trim().length === 0 || bvn.trim().length !== 11) {
            setIsValid(false)
            AlertBox.showError("Invalid BVN entered. Please check and try again.", 'Invalid Entry')
            return
        }

        setIsLoading(true)
        lookBVNData({ bvn, device: String((new Date()).getTime()) }).then(res => {
            setIsLoading(false)
            if (!res || !res.data) {
                AlertBox.showError('Unable to complete this process. Please try again later.', 'BVN Validation')
                return
            }
            const t = res.data?.data
            if (!t) {
                AlertBox.showError('Unable to complete this process. Please try again later.', 'BVN Validation')
                return
            }
            if (t.data && t.data.length) {
                delete t.data[0].face_image
            }

            if (t.responseCode && t.responseCode === '01' && t.data.length > 0) {
                /**
                 * firstName: authData.user.firstname,
            lastName: authData.user.surname,
            middleName: authData.user.middlename ? authData.user.middlename : 'not provided',
            email: authData.user.email,
            phoneNo: authData.user.phone,
            productCode: `${productCode}`,
            gender,
            bvn,
            address,
            dateOfBirth: dob,
                 */
                const auxUserData = {
                    ...authData.user,
                    firstName: t.data[0].first_name,
                    middleName: t.data[0].middle_name,
                    lastName: t.data[0].surname,
                    gender: String(t.data[0].gender).toLowerCase(),
                    dateOfBirth: new Date(t.data[0].DateOfBirth)
                }
                authData.user = auxUserData
                setDOB(Utils.toYMD(auxUserData.dateOfBirth))
                setYear(auxUserData.dateOfBirth.getFullYear())
                setGender(auxUserData.gender.toUpperCase())
                setMonth(padWithZero(auxUserData.dateOfBirth.getMonth() + 1))
                setSelectedDay(auxUserData.dateOfBirth.getDate())
                if (authData.user.dateOfBirth) {
                    delete authData.user.dateOfBirth
                }
                setAuthData({ ...authData })
                setBVNVerified(true)
                AlertBox.showSuccess(t.responseText + '. Click OK to proceed.', 'BVN Verified', () => {
                    setShowMainForm(true)
                })
            } else if (t.responseCode && t.responseCode === '00') {
                setShowMainForm(false)
                setDestination(t.url)
                AlertBox.showError("BVN verification is required for this record. You will be redirected to do so. Click OK to continue.", 'BVN Validation', () => {
                    setVerifying(false)
                    setShowNavigationWindow(true)
                })
            } else {
                setShowMainForm(false)
                AlertBox.showError('Unable to complete this process. Please try again later. #Err-URC', 'BVN Validation')
                return
            }
        })
    }

    const createAccount = () => {
        const dob = (_parsedDOB && _parsedDOB.length > 0) ? _parsedDOB : composeDOB()
        if (!dob) {
            AlertBox.showError('Date of Birth is not a valid date.')
            return;
        }
        const productCode = Config().getByName(accountType)
        if (!productCode) {
            AlertBox.showError('Invalid account type selected. If you perceive this as an error, please contact support.')
            return;
        }

        setDOB(dob)
        setIsLoading(true)
        fetchData({
            firstName: authData.user.firstname,
            lastName: authData.user.surname,
            middleName: authData.user.middlename ? authData.user.middlename : 'not provided',
            email: authData.user.email,
            phoneNo: authData.user.phone,
            productCode: `${productCode}`,
            gender,
            bvn,
            address,
            dateOfBirth: dob,
            accountType
        }).then(async (res) => {
            if (res.data && res.data.success) {
                await revalidateUserAuth()
                if (res.data.data.dateOfBirth) {
                    delete res.data.data.dateOfBirth
                }
                onSuccessful(navigation, res.data.data)
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            AlertBox.showErrorEx(err)
        }).finally(() => setIsLoading(false));
        // navigation.navigate('AccountIntroScreen')
    }


    const generateYears = () => {
        const currentYear = (new Date()).getFullYear() - 18; // Year allowed to create a bank account.
        const validYears = [];
        for (let i = 0; i < 100; i++) {
            validYears.push((currentYear - i).toString())
        }
        setYears(validYears)
    }

    const generateMonths = () => {
        const validMonths = [];
        for (let i = 1; i <= 12; i++) {
            if (i < 10) {
                validMonths.push('0' + i)
            } else {
                validMonths.push(i.toString())
            }
        }
        setMonths(validMonths)
    }

    const generateDays = (monthSelected) => {
        let endAt = 31
        if (monthsWith30Days.includes(monthSelected)) {
            endAt = 30
        } else if (monthSelected == '02') {
            endAt = 29
        }
        const validDay = [];
        for (let i = 1; i <= endAt; i++) {
            if (i < 10) {
                validDay.push('0' + i)
            } else {
                validDay.push(i.toString())
            }
        }
        setMonth(monthSelected.toString())
        setDay(validDay)
    }

    const padWithZero = (value) => {
        const n = Number(value)
        if (n < 10) {
            return `0${value}`
        }
        return value
    }

    const screenChange = (state) => {
        if (state.url.indexOf('BVNVAL/AuthConfirm') != -1) {
            setShowMainForm(false)
            setVerifying(true)
            checkBVNData()
            return
        }
    }

    const composeDOB = (day) => {
        if (!selectedDay && !day) { return false }
        let d = selectedYear + '-' + selectedMonth + '-' + (selectedDay || day)
        const t = new Date(d)
        return isNaN(t) ? false : t
    }

    if (showNavigationWindow && !verifying) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ ...styles.container, flex: 1, marginTop: 10 }}>
                    <WebView
                        ref={ref => (webview = ref)}
                        source={{ uri: destination }}
                        startInLoadingState={true}
                        renderLoading={() => isLoading ? <Loader style={{ flex: 1 }} /> : null}
                        onNavigationStateChange={screenChange}
                    />
                </View></SafeAreaView>)
    }

    return (
        <KeyboardAvoidingView h={{
            base: "400px",
            lg: "auto"
        }} behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView>
                <Box >
                    <Center h={'full'} mt={1} w="100%">
                        {hasError && <Box safeArea>
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
                        {!hasError && <Box p="2" py="4" w="full" >
                            <Heading size="2xl" fontWeight="800" color="#ffffff" >
                                Open {accountTypeLabel} Account
                            </Heading>
                            <VStack space={3} mt="3">
                                {(!authData.user.bvn || authData.user.bvn.length == 0) && <FormControl isInvalid isRequired>
                                    <FormControl.Label _text={{
                                        color: "#ffffff",
                                        fontWeight: "medium",
                                        fontSize: "sm"
                                    }}>BVN</FormControl.Label>
                                    <Input isReadOnly={bvnVerified} onChangeText={text => {
                                        setBVN(text)
                                    }} value={bvn} maxLength={11} keyboardType={'phone-pad'} placeholder={'11-digit number'} style={Shared.TextInput.default} variant={'rounded'} />
                                    {isFieldInError('bvn') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                        BVN must be set correctly.
                                    </FormControl.ErrorMessage>}
                                </FormControl>}
                                {showMainForm && <View>
                                    {(!authData.user.dob || authData.user.dob.length == 0) && <FormControl isRequired isInvalid>
                                        <FormControl.Label _text={{
                                            color: "#ffffff",
                                            fontWeight: "medium",
                                            fontSize: "sm"
                                        }} >Date of Birth</FormControl.Label>
                                        {!bvnVerified && <HStack space={3} paddingRight={5}>
                                            <Select onValueChange={(v) => {
                                                setYear(v.toString())
                                            }} value={selectedYear} placeholder={'Year'} bgColor={'#ffffff'} borderRadius={20} w={'100'} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                                {years && years.map(y => <Select.Item key={y} label={y} value={y} />)}
                                            </Select>
                                            <Select
                                                value={selectedMonth}
                                                onValueChange={(e) => generateDays(e)}
                                                placeholder={'Month'} bgColor={'#ffffff'} borderRadius={20} w={'100'} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                                {months && months.map(y => <Select.Item key={y} label={y} value={y} />)}
                                            </Select>
                                            <Select onValueChange={(v) => {
                                                setSelectedDay(v.toString())
                                                const dob = composeDOB(v.toString())
                                                if (dob) {
                                                    setDOB(dob)
                                                }
                                            }} placeholder={'Day'} value={selectedDay} bgColor={'#ffffff'} borderRadius={20} w={'100'} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                                {day && day.map(y => <Select.Item key={y} label={y} value={y} />)}
                                            </Select>

                                        </HStack>}
                                        {bvnVerified && <Box>
                                            <Text fontSize={'xl'} color={'#ffffff'}>{Utils.toYMD(dateofbirth)}</Text>
                                        </Box>}
                                        {(isFieldInError('dateofbirth')) && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                            Date selection not valid
                                        </FormControl.ErrorMessage>}
                                    </FormControl>}
                                    {(!authData.user.gender || authData.user.gender.length == 0) && !bvnVerified && <FormControl mt={3} isInvalid isRequired>
                                        <FormControl.Label _text={{
                                            color: "#ffffff",
                                            fontWeight: "medium",
                                            fontSize: "sm"
                                        }} >Gender</FormControl.Label>
                                        <Radio.Group onChange={(v) => {
                                            setGender(v)
                                        }} isReadOnly={bvnVerified} value={gender} name="exampleGroup" defaultValue="" accessibilityLabel="pick a size">
                                            <Stack direction={{
                                                base: "row",
                                                md: "row"
                                            }} alignItems={{
                                                base: "flex-start",
                                                md: "center"
                                            }} space={4} w="75%" maxW="300px">
                                                <Radio value="male" colorScheme="orange" size="lg" my={1}>
                                                    <Text color={'#a0a5ab'}> Male</Text>
                                                </Radio>
                                                <Radio value="female" colorScheme="orange" size="lg" my={2}>
                                                    <Text color={'#a0a5ab'}>Female</Text>
                                                </Radio>
                                            </Stack>
                                        </Radio.Group>
                                        {isFieldInError('gender') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                            Please select a gender.
                                        </FormControl.ErrorMessage>}
                                    </FormControl>}
                                    {bvnVerified && <FormControl mt={3}>
                                        <FormControl.Label _text={{
                                            color: "#ffffff",
                                            fontWeight: "medium",
                                            fontSize: "sm"
                                        }} >Gender</FormControl.Label>
                                        <Box>
                                            <Text fontSize={'xl'} color={'#ffffff'}>{gender}</Text>
                                        </Box>
                                    </FormControl>}

                                    <FormControl isInvalid isRequired mt={5}>
                                        <FormControl.Label type={'Email'} _text={{
                                            color: "#ffffff",
                                            fontWeight: "medium",
                                            fontSize: "sm"
                                        }}>Residential Address</FormControl.Label>
                                        <Input onChangeText={text => {
                                            setAddress(text)
                                        }} value={address} keyboardType={'default'} style={Shared.TextInput.default} variant={'rounded'} />
                                        {isFieldInError('address') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                            Address not properly filled.
                                        </FormControl.ErrorMessage>}

                                    </FormControl>
                                </View>}
                                {/* <FormControl mt={2} isInvalid isRequired>
                                <FormControl.Label _text={{
                                    color: "#ffffff",
                                    fontWeight: "medium",
                                    fontSize: "sm"
                                }}>Save towards</FormControl.Label>
                                <Radio.Group  onChange={(v) => {
                                    setSaveTowards(v)
                                }}  value={savetoward} name="exampleGroup" defaultValue="" accessibilityLabel="pick a size">
                                    <Stack direction={{
                                        base: "row",
                                        md: "row"
                                    }} alignItems={{
                                        base: "flex-start",
                                        md: "center"
                                    }} space={4} w="75%" maxW="300px">
                                        <Radio value="buy" colorScheme="orange" size="lg" my={1}>
                                        <Text color={'#a0a5ab'}> Buying a home</Text>
        </Radio>
                                        <Radio value="rent" colorScheme="orange" size="lg" my={2}>
                                        <Text color={'#a0a5ab'}>Rent</Text>
        </Radio>
                                    </Stack>
                                </Radio.Group>
                                {isFieldInError('savetoward') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    Please select one.
                            </FormControl.ErrorMessage>}

                            </FormControl> */}
                                {showMainForm && <Button
                                    isLoading={isLoading}
                                    isDisabled={!isValid}
                                    onPress={() => createAccount()}
                                    mt={5} variant={'solid'} w={"full"} size={'lg'} style={Shared.Button.primary} >
                                    Next
                                </Button>}
                                {!showMainForm && <Button
                                    isLoading={isLoading}
                                    isDisabled={!bvn || bvn.length !== 11}
                                    onPress={() => checkBVNData()}
                                    mt={5} variant={'solid'} w={"full"} size={'lg'} style={Shared.Button.primary} >
                                    Verify BVN
                                </Button>}
                            </VStack>
                        </Box>}
                    </Center>
                </Box></ScrollView></KeyboardAvoidingView>
    )
}

export default CreateAccountScreen;