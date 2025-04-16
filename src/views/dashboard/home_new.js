import React, { useState, useCallback, useEffect } from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import { Box, VStack, HStack, Center, FormControl, Link, useDisclose, ScrollView, Actionsheet, Button, Select, Image, Text, FlatList, Icon, IconButton, Flex, Spacer, Skeleton } from "native-base";
import { useFocusEffect } from '@react-navigation/native'
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from "expo-clipboard";

import Card from '../../components/card'
import Profile from '../../components/profile'
import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import BillCard from '../../components/billcard';
import AffiliateCard from '../../components/affiliate_card';
import CardPanel from '../../components/cardpanel';
import Currency from '../../components/currency';
import InLineLoader from '../../components/inline_loader';
import { TouchableOpacity } from 'react-native';
import HomeVestCard from '../../components/modules/homevestcard';


const AccountTypesStruct = {
    IVANTAGE: 'ivantage',
    CURRENT: 'current'
}

const { Transfer, RequestCard, AccountManager, Payment, PaymentHistory, Bills } = Theme.SVG

const HomeScreen = ({ navigation }) => {
    const { fetchData: getAccounts } = useAuthentication('getbankaccounts', 'get', navigation);
    const { fetchData: getAccountTypes } = useAuthentication('getaccounttypes', 'get', navigation);
    const { fetchData: fetchInvestments } = useAuthentication('getinvestments', 'get', navigation);
    const { fetchData: fetchAccountBalance } = useAuthentication('getaccountbalance', 'get', navigation, false);

    // New Dashboard
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [displayAccountBalance, setDisplayAccountBalance] = useState(false)
    const [accountBalanceInfo, setAccountBalanceInfo] = useState(null)
    const [acctLoading, setAcctLoading] = useState(true)
    const [accountToOpen, setAccountToOpen] = useState(null)
    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclose();

    const [accounts, setAccounts] = useState([])
    const [accountTypes, setAccountTypes] = useState({})
    const [userAccountMap, setUserAccountMap] = useState({})
    const [investments, setInvestments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasAccount, setHasAccount] = useState(false)

    const { authData } = useUser();

    //getAccounts
    useFocusEffect(useCallback(() => {
        loadAccountInfo(true)
        getInvestments()
        checkBVNVerificationRequired()
    }, []))

    useEffect(() => {
        loadAccountInfo()
        getInvestments()
        checkBVNVerificationRequired()
    }, [])

    const loadAccountInfo = async (in_background) => {
        if (!in_background) {
            setIsLoading(true)
        }
        const accountTypeData = await getBankAccountTypes()
        await getUserBankAccounts(accountTypeData)
        if (!in_background) {
            setIsLoading(false);
        }
    }

    const checkBVNVerificationRequired = () => {
        if (authData && authData.user && !authData.user.bvnVerified && hasAccount) {
            AlertBox.confirmBox('You need to verify your BVN to keep your accounts active.',
                () => {
                    navigation.navigate('BVNValidationScreen', {})
                }, () => { }, 'BVN Validation Required', { okText: 'Validate BVN', cancelText: 'Not Now' })
        }
    }

    const getAccountBalance = async (accountKey, accountTypesMap) => {
        const accountNo = accountTypesMap[accountKey]?.userAccount?.account_info?.AccountNo
        if (accountNo === undefined) {
            setAccountToOpen(accountTypesMap[accountKey])
            onOpen()
            return
        }
        setAcctLoading(true)
        setSelectedAccount(accountNo)
        await fetchAccountBalance({
            params: { accountNo }
        }).then(res => {
            setAcctLoading(false)
            if (res?.data?.success) {
                setAccountBalanceInfo(res?.data?.data)
                return
            }
            // AlertBox.showErrorEx(res);
            return
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return
        })
    }

    const copyToClipboard = async (strData) => {
        if (!strData?.accountNo && !selectedAccount) {
            AlertBox.showError('Account number not available for this account.');
            return
        }
        await Clipboard.setStringAsync(`${strData.accountDesc ?? ''}\n ${strData.accountNo ?? selectedAccount} \nImperial Homes Mortgage Bank`)
        AlertBox.showSuccess(`Account details for ${strData.accountNo ?? selectedAccount} copied successfully.`, "Copied");
    };

    const getInvestments = async () => {
        await fetchInvestments({}).then(res => {
            if (res && res.data && res.data.success) {
                if (res.data.data.length > 0) {
                    setInvestments(res.data.data)
                } else {
                    setInvestments([])
                }
                return
            }
            AlertBox.showErrorEx(res);
            return
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return
        })
    }

    const getUserBankAccounts = async (accountMap) => {
        try {
            const accts = []
            const res = await getAccounts();
            if (res?.data?.success) {
                let accountKey = null
                if (res.data?.data?.length > 0) {
                    (res.data?.data || []).map((item) => {
                        if (item.account_type in accountMap && accountMap[item.account_type]) {
                            setHasAccount(true)
                            accountMap[item.account_type].userAccount = item
                            accts.push(item.account_type)
                            if (!accountKey) {
                                accountKey = item.account_type
                            }
                        }
                    })
                }
                setUserAccountMap([...accts])
                setAccountTypes(accountMap)
                const firstAccountKey = accountKey ?? Object.keys(accountMap)[0]
                const firstAccountData = accountMap[firstAccountKey]
                if (firstAccountData?.userAccount) {
                    await getAccountBalance(firstAccountKey, accountMap)
                    setSelectedAccount(firstAccountData?.userAccount?.account_info?.AccountNo)
                } else {
                    setAccountToOpen(firstAccountData)
                    setHasAccount(false)
                    onOpen()
                    return false
                }

                return true; // Success
            }
            AlertBox.showErrorEx(res);
        } catch (err) {
            AlertBox.showErrorEx(err);
        }
        return false
    }

    const goTo = (slug, item) => {
        navigation.navigate(slug, item)
    }

    const getBankAccountTypes = async () => {
        try {
            const res = await getAccountTypes();
            if (res?.data?.success) {
                const accountMap = {};
                (res.data.data || []).forEach((item) => {
                    if (item.accessibility.includes('mobile')) {
                        accountMap[item.name] = item
                    }
                });
                setAccountTypes(accountMap)
                return accountMap;
            }
            AlertBox.showErrorEx(res);
        } catch (err) {
            AlertBox.showErrorEx(err);
        }
        return {}; // Return an empty object as a fallback
    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <>
            <ScrollView style={{ ...styles.container }}>
                <Box safeArea mt={3} mb={90}>
                    <Box px="2" w="full" >
                        <Profile navigation={navigation} userData={authData} />
                        <VStack>
                            {hasAccount && <CardPanel h={185} key={'account-card'}>
                                <Box>
                                    <Flex direction='row' justify='space-between'>
                                        {accountTypes && Object.values(accountTypes).length > 0 && <Box flex={1} mt={1} px={3}>
                                            <Text color={'orange.100'} style={{ fontSize: 14 }} mb={1}>Accounts</Text>
                                            <Select
                                                color={'#ffffff'}
                                                fontWeight={'bold'}
                                                borderWidth={1}
                                                borderColor={'orange.100'}
                                                onValueChange={item => {
                                                    getAccountBalance(item, accountTypes)
                                                }}
                                                defaultValue={selectedAccount} accessibilityLabel="Choose Account" placeholder="Choose Account">
                                                {accountTypes && Object.values(accountTypes).map((accountData, indx) =>
                                                    <Select.Item key={accountData.name} label={`${accountData.label} - ${accountData.userAccount?.account_info?.AccountNo || 'No Account'}`} value={accountData.name} />
                                                )
                                                }
                                            </Select>
                                        </Box>}
                                        {selectedAccount && <Box mt={2} >
                                            <TouchableOpacity onPress={() => copyToClipboard(accountBalanceInfo)}>
                                                <Box m={5} p={2} bg={'orange.800'} style={{ borderRadius: 10 }}>
                                                    <HStack space={1} >
                                                        <Text color={'#ffffff'}>
                                                            {selectedAccount}
                                                        </Text>
                                                        <IconButton icon={<Icon size={14} color={'orange.100'} as={FontAwesome} name={'copy'} />} size={4} variant={'ghost'} />
                                                    </HStack>
                                                </Box>
                                            </TouchableOpacity>
                                        </Box>}
                                    </Flex>
                                </Box>
                                <Box mt={2} p={3} h={100}>
                                    <Center>
                                        {!acctLoading && <Box >
                                            <HStack>
                                                {displayAccountBalance && <Currency fontSize={25} color={'#ffffff'} fontWeight={'extrabold'} value={accountBalanceInfo?.availableBalance ?? 0.00} />}
                                                {!displayAccountBalance && <Text fontSize={25} color={'#ffffff'} fontWeight={'extrabold'}>* * * * * * * * * * * *</Text>}
                                                <IconButton onPress={() => setDisplayAccountBalance(!displayAccountBalance)} ml={5} mt={2} icon={<Icon size={23} color={'orange.100'} as={FontAwesome} name={!displayAccountBalance ? 'eye-slash' : 'eye'} />} size={4} variant={'ghost'} />
                                            </HStack>
                                        </Box>}
                                        {!acctLoading && <Box mt={2}>
                                            <HStack>
                                                <Text fontSize={12} mr={2} color={'#ffffff'}>Book Balance</Text>
                                                {displayAccountBalance && <Currency fontSize={12} color={'#ffffff'} fontWeight={'bold'} value={accountBalanceInfo?.ledgerBalance ?? 0.00} />}
                                                {!displayAccountBalance && <Text fontSize={12} color={'#ffffff'} fontWeight={'bold'} >* * * * * * * * * * * *</Text>}
                                            </HStack>
                                        </Box>}
                                        <Box>
                                            {acctLoading && <Text fontSize={16} color={'amber.100'}>Refreshing Balance...</Text>}
                                        </Box>
                                    </Center>
                                </Box>
                            </CardPanel>}
                        </VStack>
                        <VStack>
                            <Flex p={1} direction="row" justifyContent="space-between">
                                <TouchableOpacity onPress={() => goTo('savings_tranfers_menu', {})} delayPressIn={0}>
                                    <Box mb={2} alignItems={'center'} p={5} style={{ backgroundColor: Theme.Colors.backgroundColor, borderColor: Theme.Colors.backgroundColorAlt, borderRadius: 10, borderWidth: 0 }}>
                                        <Transfer marginTop={5} height={30} />
                                    </Box>
                                    <Text style={{ fontSize: 11, color: '#ffffff', textAlign: 'center' }}>Transfer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => goTo('TransactionHistoryScreen', {})} delayPressIn={0}>
                                    <Box mb={2} alignItems={'center'} p={5} style={{ backgroundColor: Theme.Colors.backgroundColor, borderColor: Theme.Colors.backgroundColorAlt, borderRadius: 10, borderWidth: 0 }}>
                                        <PaymentHistory marginTop={5} height={30} />
                                    </Box>
                                    <Text style={{ fontSize: 11, color: '#ffffff', textAlign: 'center' }}>Trans. History</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => goTo('bills.home', {})} delayPressIn={0}>
                                    <Box mb={2} alignItems={'center'} p={5} style={{ backgroundColor: Theme.Colors.backgroundColor, borderColor: Theme.Colors.backgroundColorAlt, borderRadius: 10, borderWidth: 0 }}>
                                        <Bills marginTop={5} height={30} />
                                    </Box>
                                    <Text style={{ fontSize: 11, color: '#ffffff', textAlign: 'center' }}>Bills Payment</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => goTo('CardRequestScreen', {})} delayPressIn={0}>
                                    <Box mb={2} alignItems={'center'} p={5} style={{ backgroundColor: Theme.Colors.backgroundColor, borderColor: Theme.Colors.backgroundColorAlt, borderRadius: 10, borderWidth: 0 }}>
                                        <RequestCard marginTop={5} height={30} />
                                    </Box>
                                    <Text style={{ fontSize: 11, color: '#ffffff', textAlign: 'center' }}>Request Card</Text>
                                </TouchableOpacity>
                            </Flex>
                        </VStack>
                    </Box>
                    <HomeVestCard onPress={() => onOpen()} hasAccount={hasAccount} navigation={navigation} />
                    <AffiliateCard navigation={navigation} />
                    <Box mt={3} px={3}>
                        <Text style={{ color: 'gray', fontSize: 18, fontWeight: "bold" }}>Fixed Deposit Investments</Text>
                    </Box>
                    {(!investments || investments.length == 0) && <Box mt={3} px={2} w={Shared.DeviceDimensions.WIDTH}>
                        <Card
                            w={Shared.DeviceDimensions.WIDTH - 20}
                            maxW={Shared.DeviceDimensions.WIDTH - 20}
                            onPress={(e) => {
                                navigation.navigate('Investment', { params: {}, screen: 'investment' })
                            }}
                            // w={'full'}
                            subtitleIcon={
                                <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={'ivantage'} />}
                            cardIcon={
                                <Image width={35} mt={3} resizeMode="contain" source={Theme.Icons.diamond} alt={'ivantage'} />}
                            color={Theme.CustomTheme['card-green']} title={`New Investment Account`} subtitle={`Create investment account to enjoy the best interest rates`}
                            actionBtn={<Box>
                                <Button
                                    onPress={() => navigation.navigate('Investment', { params: {}, screen: 'investment' })}
                                    mt="4" mr={5} variant={'solid'} w={150} size={'sm'} style={{ ...Shared.Button.primary, alignSelf: 'flex-end' }} >
                                    Create Investment
                                </Button>
                            </Box>}
                        />
                    </Box>}
                    {investments && investments.length > 0 && <FlatList maxW={Shared.DeviceDimensions.WIDTH} w={Shared.DeviceDimensions.WIDTH} horizontal={true} data={investments} renderItem={({ item, index }) => {
                        return (<Card
                            onPress={(e) => {
                                navigation.navigate('Investment', { params: { item, index }, screen: 'investment' })
                            }}
                            w={Shared.DeviceDimensions.WIDTH - 20}
                            ml={2}
                            mr={2}
                            key={item.accountNo}
                            subtitleIcon={
                                <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={'ivantage'} />}
                            cardIcon={
                                <Image width={35} mt={3} resizeMode="contain" source={Theme.Icons.diamond} alt={'ivantage'} />}
                            color={Theme.CustomTheme['card-green']} title={`Investment Account`} subtitle={`${item.accountNo}`} />)
                    }} />}
                </Box>

            </ScrollView>
            <Actionsheet isOpen={isOpen} onClose={onClose} disableOverlay={!hasAccount} >
                <Actionsheet.Content style={{ backgroundColor: '#f9f9f9' }} >
                    <Box mb={7} w="100%" h={100} px={4} justifyContent="center">
                        <Box><Text textAlign={'center'} fontSize={'2xl'} fontWeight={'extrabold'} color={'#000000'}>
                            Create New {accountToOpen?.label} Account
                        </Text></Box>
                        <Box mt={3}>
                            <Text textAlign={'center'} fontSize="16" color="gray.500" _dark={{
                                color: "gray.300"
                            }}>
                                {!hasAccount ? "You don't seem to have any existing account. Create a new bank account or link all your accounts if you already have accounts with Imperial Homes Mortgage Bank" : ''}
                            </Text>
                        </Box>
                    </Box>

                    <Box mt={5}>
                        <Button h={50} w={'400'} variant={'solid'} style={Shared.Button.primary} onPress={() => {
                            onClose()
                            navigation.navigate('CreateAccountScreen', { accountType: accountToOpen.name, accountTypeLabel: accountToOpen.label, authData })
                        }}>
                            Proceed
                        </Button>
                    </Box>
                    <Box mt={5} mb={5}>
                       <Text fontWeight={'extrabold'} color={'#000000'}>OR LINK YOUR</Text>
                    </Box>
                    <Flex justify='space-between' mt={5} mb={10} direction='row'>
                        {Object.values(accountTypes).filter(t => !userAccountMap.includes(t.name)).map(accountType => {
                            return (<Button _text={{fontWeight: 'extrabold'}} mx={1} flex={1} key={accountType.name} h={50} colorScheme={'orange'} variant={'outline'} style={Shared.Button.primary_outline} onPress={() => {
                                onClose()
                                navigation.navigate('AddAccountScreen', { accountType: accountType.name, accountTypeLabel: accountType.label, authData })
                            }}>{`${accountType.label} Account`}</Button>)
                        })}
                    </Flex>
                </Actionsheet.Content>
            </Actionsheet>
        </>
    )
}

export default HomeScreen;