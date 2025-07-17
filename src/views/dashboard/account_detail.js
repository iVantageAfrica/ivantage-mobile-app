import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { FlatList, View, TouchableOpacity, Dimensions } from 'react-native'
import { Box, VStack, HStack, Center, Link, WarningOutlineIcon, Input, Button, Text, Image, ScrollView } from "native-base";
import BigCard from '../../components/bigcard'
import TransactionItem from '../../components/transactionitem'
import { useAuthentication } from "../../queries/useAuthentication";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native'
import Currency from '../../components/currency'
import Config from '../../common/config'


import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'

const { Transfer, RequestCard, AccountManager, Payment, PaymentHistory, Bills } = Theme.SVG

const AccountDetailScreen = ({ navigation, route }) => {

    const { fetchData: fetchAccountDetail } = useAuthentication('getaccountdetail', 'get', navigation, false);
    const { fetchData: getAccounts } = useAuthentication('getbankaccounts', 'get', navigation);
    const { fetchData: fetchAccountBalance } = useAuthentication('getaccountbalance', 'get', navigation, false);

    const [isLoading, setIsLoading] = useState(true)
    const [isCardLoading, setCardIsLoading] = useState(false)
    const [accountData, setAccountData] = useState(null)
    const [accountBalanceInfo, setAccountBalanceInfo] = useState(null)
    const [allAccounts, setAllAccounts] = useState([])

    const { authData, setAuthData } = useUser();

    const _viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 20,
        waitForInteraction: true,
        minimumViewTime: 1
    })
    const cardWidth = Dimensions.get("window").width
    let listRef = useRef()

    useFocusEffect(useCallback(() => {
        (async () => {
            const accts = await getUserBankAccounts()
            if (accts && accts.length > 0) {
                await getAccountDetail(accts[0].account_type)
            }
            setIsLoading(false)
        })()
    }, []))

    const onNoAccount = (navigation) => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    }

    const getUserBankAccounts = async () => {
        return getAccounts().then(res => {
            if (res && res.data && res.data.success) {
                const relevantAccts = res.data.data.filter((item) => item.account_type !== 'ivantage')
                setAllAccounts([...relevantAccts])
                return relevantAccts
            }
            AlertBox.showErrorEx(res);
        }).catch(err => {
            AlertBox.showErrorEx(err);
        })
    }

    const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
        const newSlide = changed.filter(t => t.isViewable)

        if (newSlide.length == 0) {
            // setSelectedInvestment(null)
            return
        }
        setAccountData(newSlide[0].item)
        getAccountDetail(newSlide[0].item.account_type)
    })

    const getItemLayout = (data, index) => (
        { length: cardWidth, offset: cardWidth * index, index }
    )

    const onKYCPending = (navigation) => {
        const activeAcct = allAccounts.filter(item => item.account_info.AccountStatus === 'Approved')
        if (activeAcct && activeAcct.length > 0) {
            let activeIndex = -1
            for (let index = 0; index < allAccounts.length; index++) {
                const element = allAccounts[index];
                if (element && element.account_info.AccountStatus === 'Approved') {
                    activeIndex = index
                    break
                }
            }
            if (activeIndex > -1 && listRef && listRef.current) {
                listRef.current.scrollToIndex({ index: activeIndex, animated: true, })
            }
            return
        }
        // onNoAccount(navigation)
    }

    const getAccountDetail = async (account_type) => {
        setCardIsLoading(true)
        const accountDataInfo = await fetchAccountDetail({
            params: { account_type }
        }).then(res => {
            if (res && res.data && res.data.success) {
                if (res.data.data.length > 0) {
                    if (res.data.data[0].account_info && res.data.data[0].account_info.AccountStatus === 'pending_kyc') {
                        AlertBox.confirmBox("You have not completed your KYC requirement. Please upload the documents requested for in the next screen.", () => {
                            navigation.navigate('AccountDocumentScreen', { params: { account_code: res.data.data[0].account_info.CustomerCode, account_number: res.data.data[0].account_info.AccountNo } })
                        }, () => onKYCPending(navigation));
                    }
                    return res.data.data[0]
                }
                AlertBox.confirmBox("You have not opened an account here. Would you like to open one now?", () => {
                    navigation.navigate('CreateAccountScreen', { accountType: 'current', authData })
                }, () => onKYCPending(navigation));
            }
            AlertBox.showErrorEx(res);
            return null
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return null
        })
        if (accountDataInfo) {
            setAccountData(accountDataInfo)

        }
        setCardIsLoading(false)
    }

    const goTo = (menu) => {
        navigation.navigate(menu)
    }

    const renderAccountItem = ({ item }) => {
        const lbl = Config().getLabel(item.account_type)
        const balanceLabel = isCardLoading ? '...' : (accountData && accountData.balanceInfo && accountData.balanceInfo.availableBalance ? accountData.balanceInfo.availableBalance : '0.00')
        return (<BigCard
            w={cardWidth}
            label2_subtitle={'Balance'}
            label2_title={<Currency py={1} style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }} value={balanceLabel} />}

            subtitleIcon={
                <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={lbl} />}
            cardIcon={
                <Image width={35} resizeMode="contain" source={Theme.Icons.ivantage_acc_icon} alt={lbl} />}
            color={Theme.CustomTheme['card-blue']} title={lbl} subtitle={item.account_info.AccountNo} />)
    }

    if (isLoading && allAccounts.length === 0) {
        return <Loader />
    }

    return (
        <>
            <ScrollView mb={50}>
                <Box style={{ ...styles.container }} mb={5}>
                    {isCardLoading && <Box mt={3}>
                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>Refreshing...</Text>
                    </Box>}
                    <VStack px={3}>
                        {allAccounts && allAccounts.length > 0 && <FlatList
                            horizontal={true}
                            ref={ref => {
                                listRef = ref;
                            }}
                            snapToAlignment="center"
                            decelerationRate={"fast"}
                            data={allAccounts}
                            keyExtractor={item => item.objectId}
                            initialScrollIndex={0.01}
                            getItemLayout={getItemLayout}
                            snapToInterval={cardWidth}
                            renderItem={renderAccountItem}
                            onLayout={() => {
                                if (listRef != null) {
                                    //Need this for initial widget lazy render
                                    listRef.recordInteraction();
                                }
                            }}
                            onViewableItemsChanged={onViewableItemsChanged.current}
                            viewabilityConfig={_viewabilityConfig.current}
                        />}
                    </VStack>
                    <Center px={0} w="100%">
                        <VStack space={5} p={7}>
                            <HStack w={'full'} space={5}>
                                <Box w={'1/2'} h={110} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                                    <TouchableOpacity onPress={() => goTo('savings_tranfers_menu')} delayPressIn={0}>
                                        <Box mb={2} alignItems={'center'}>
                                            <Transfer marginTop={20} width={100} height={40} />
                                        </Box>
                                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>Transfer</Text>
                                    </TouchableOpacity>
                                </Box>
                                {/* <Box w={'1/3'} h={110} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10}}>
                            <Payment marginTop={20} width={100} height={40} />
                            <Text style={{color: '#ffffff', textAlign: 'center'}}>Payment</Text>
                        </Box> */}
                                <Box w={'1/2'} h={110} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                                    <TouchableOpacity onPress={() => goTo('TransactionHistoryScreen')}>
                                        <Box mb={2} alignItems={'center'}>
                                            <PaymentHistory marginTop={20} width={100} height={40} />
                                        </Box>
                                        <Text style={{ color:  Theme.Colors.primaryText, textAlign: 'center' }}>Transaction History</Text>
                                    </TouchableOpacity>
                                </Box>
                            </HStack>
                            <HStack w={'full'} space={5}>
                                <Box w={'1/2'} h={110} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                                    <TouchableOpacity onPress={() => goTo('AccountManagerScreen')}>
                                        <Box mb={2} alignItems={'center'}>
                                            <AccountManager marginTop={20} width={100} height={40} />
                                        </Box>
                                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>Account Manager</Text>
                                    </TouchableOpacity>
                                </Box>
                                {/* <Box w={'1/3'} h={110} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10}}>
                            <BankStatement marginTop={20} width={100} height={40} />
                            <Text style={{color: '#ffffff', textAlign: 'center'}}>Bank Statement</Text>
                        </Box> */}
                                <Box w={'1/2'} h={110} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                                    <TouchableOpacity onPress={() => goTo('CardRequestScreen')}>
                                        <Box mb={2} alignItems={'center'}>
                                            <RequestCard marginTop={20} width={100} height={40} />
                                        </Box>
                                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>Request Card</Text>
                                    </TouchableOpacity>
                                </Box>
                            </HStack>
                            <HStack w={'full'} space={5}>
                                <Box w={'1/2'} h={110} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                                    <TouchableOpacity onPress={() => goTo('bills.home')}>
                                        <Box mb={2} alignItems={'center'}>
                                            <Bills marginTop={20} width={100} height={40} />
                                        </Box>
                                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>Bills Payment</Text>
                                    </TouchableOpacity>
                                </Box>
                            </HStack>
                        </VStack>
                    </Center>
                </Box>
            </ScrollView>
        </>
    )
}

export default AccountDetailScreen;