import React, { useEffect, useState, useCallback } from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { FlatList, View, TouchableOpacity } from 'react-native'
import { Box, VStack, HStack, Center, Link, WarningOutlineIcon, Input, Button, Text, Image, ScrollView } from "native-base";
import BigCard from '../../components/bigcard'
import TransactionItem from '../../components/transactionitem'
import { useAuthentication } from "../../queries/useAuthentication";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native'
import Currency from '../../components/currency'

import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'

import TransactionHistory from '../partials/transaction_history'


const SavingsScreen = ({ navigation, route }) => {
    const { fetchData } = useAuthentication('featuredproperties', 'get', navigation);
    const { fetchData: fetchAccountDetail } = useAuthentication('getaccountdetail', 'get', navigation);
    const { fetchData: fetchAccountBalance } = useAuthentication('getaccountbalance', 'get', navigation, false);

    const [isLoading, setIsLoading] = useState(true)
    const [featuredProperties, setFeaturedProperties] = useState([])
    const [accountData, setAccountData] = useState(null)
    const [isAccountReady, setIsAccountReady] = useState(null)
    const [accountBalanceInfo, setAccountBalanceInfo] = useState(null)

    const { authData, setAuthData } = useUser();

    // useEffect(() => {
    //     getFeaturedProperties()
    // }, [])

    useFocusEffect(useCallback(() => {
        getAccountDetail()
        getFeaturedProperties()
    }, []))

    const onNoAccount = (navigation) => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    }

    const goToKYCPage = (accountData) => {
        navigation.navigate('AccountDocumentScreen', { params: { account_code: accountData.account_info.CustomerCode, account_number: accountData.account_info.AccountNo } })
    }

    const getAccountDetail = async () => {
        setIsLoading(true)
        const accountDataInfo = await fetchAccountDetail({
            params: { account_type: 'ivantage' }
        }).then(res => {
            if (res && res.data && res.data.success) {
                if (res.data.data.length > 0) {
                    if (res.data.data[0].account_info && res.data.data[0].account_info.AccountStatus === 'pending_kyc') {
                        setIsAccountReady(false)
                        AlertBox.confirmBox("You have not completed your KYC requirement. Please upload the documents requested for in the next screen.", () => {
                            navigation.navigate('AccountDocumentScreen', { params: { account_code: res.data.data[0].account_info.CustomerCode, account_number: res.data.data[0].account_info.AccountNo } })
                        }, () => { });
                    } else {
                        setIsAccountReady(true)
                    }
                    return res.data.data[0]
                }
                AlertBox.confirmBox("You have not opened an account here. Would you like to open one now?", () => {
                    navigation.navigate('CreateAccountScreen', { accountType: 'ivantage', authData })
                }, () => onNoAccount(navigation));
            }
            return
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return
        })
        if (accountDataInfo) {
            setAccountData(accountDataInfo)
            await getAccountBalance(accountDataInfo.account_info.AccountNo)
            setIsLoading(false)
        }
    }

    const getFeaturedProperties = () => {
        fetchData().then(res => {
            if (res && res.data && res.data.success) {
                setFeaturedProperties(res.data.data)
                return
            }
            AlertBox.showErrorEx(res);
            return
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return
        })
    }

    const getAccountBalance = async (accountNo) => {
        await fetchAccountBalance({
            params: { accountNo }
        }).then(res => {
            if (res && res.data && res.data.success) {
                setAccountBalanceInfo(res.data.data)
                return
            }
            // AlertBox.showErrorEx(res);
            return
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return
        })
    }

    const goToDetail = (property) => {
        //PropertyDetailScreen
        navigation.navigate('PropertyDetailScreen', { property })
    }

    const goToFundAccount = (account_info) => {
        //FundAcctScreen
        navigation.navigate('FundAcctScreen', { account_info, accountType: accountData.accountType })
    }

    const renderPropertyItem = ({ item, index }) => {
        if (item.images) {
            return (<TouchableOpacity onPress={() => goToDetail(item)}>
                <View key={item.objectId} style={{ marginRight: 5 }}>
                    <Image style={{ height: 130, width: 300, borderRadius: 10 }} resizeMode={'cover'} source={{ uri: item.images[0].url }} alt={item.name} />
                    <View style={{ position: 'absolute', width: '100%', bottom: 0, display: 'flex' }}>
                      {/* <LinearGradient style={{ flex: 1, paddingBottom: 8, paddingLeft: 8, paddingRight: 8 }} colors={['transparent', 'rgba(0,0,0,0.9)']}>
                            <Text style={{ color: '#ffffff', fontSize: 10 }}>{item.district}, {item.state}</Text>
                            <Text style={{ color: '#ffffff' }}>{item.name}</Text>
                            <Currency style={{ color: '#ffffff', fontSize: 12 }} value={item.price} />
                     </LinearGradient> */}
                    </View>
                </View></TouchableOpacity>
            )
        }

    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <Box style={{ ...styles.container }} mb={5}>
            <Center px={0} >
                <Box>
                    <VStack >
                        {accountData && accountData.account_info && <BigCard
                            label2_subtitle={'Balance'}
                            label2_title={<Currency py={1} style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }} value={accountData && accountData.balanceInfo ? accountData.balanceInfo.availableBalance : '0'} />}
                            // label3_subtitle={'Account Status'}
                            // label3_title={accountData.balanceInfo.accountStatusDesc}
                            // label4_subtitle={'Book Balance'}
                            // label4_title={<Currency value={accountData && accountData.balanceInfo ? accountData.balanceInfo.ledgerBalance : '0'} />}
                            // label4_title={`N${accountData && accountData.balanceInfo ?  accountData.balanceInfo.availableBalance : '--'}`}
                            // label5_subtitle={'Monthly Funding'}
                            // label5_title={'N200,000.00'}
                            // label6_subtitle={'Last Funding'}
                            // label6_title={'26th Apr. 2022'}
                            // label7_subtitle={'Next Funding'}
                            // label7_title={'26th May. 2022'}
                            w={'full'}
                            subtitleIcon={
                                <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={accountData.accountType.label} />}
                            cardIcon={
                                <Image width={35} resizeMode="contain" source={Theme.Icons.ivantage_acc_icon} alt={accountData.accountType.label} />}
                            color={Theme.CustomTheme['card-orange']} title={accountData.accountType.label} subtitle={accountData.account_info.AccountNo} />}

                    </VStack>
                </Box>

                {accountData && accountData.account_info && accountData.account_info.AccountNo && isAccountReady && <Box w={'90%'} pb={3} style={{ borderBottomWidth: 2, borderBottomColor: '#212c37' }} >
                    <Button onPress={() => goToFundAccount(accountData.account_info)} mt="2" variant={'solid'} w={"full"} size={'md'} style={Shared.Button.primary} >
                        Fund Account
                    </Button>
                </Box>}
            </Center>
            {!isAccountReady && <Box m={3} p={5} style={styles.container2} >
                <Box>
                    <Text
                        fontSize={15}
                        color={Theme.CustomTheme["color-active-button"]}
                    >
                        Account Information
                    </Text>
                    <Text color={"#ffffff"}>
                        You are required to complete your KYC tasks to activate this account.
                    </Text>
                </Box>
                <Box>
                    <Button onPress={() => goToKYCPage(accountData)} mt="5"
                        w={'full'}
                        _text={{ color: "amber.100", fontSize: "xs" }}
                        style={{ ...Shared.Button.primary_outline, marginVertical: 15 }}
                        variant={"ghost"}
                    >
                        Complete KYC Requirements
                    </Button>
                </Box>
            </Box>}
            <ScrollView  >
                <Box mb={70}>

                    {featuredProperties.length > 0 && <VStack px={5} space={2}>
                        <Box>
                            <Text style={{ color: 'gray' }}>Feature Properties</Text>
                        </Box>
                        <Box style={{ height: 140, borderRadius: 20 }}>
                            {/* <FlatList pagingEnabled={true} style={{ height: 130, marginTop: 7 }} horizontal={true} renderItem={(item) => renderPropertyItem(item)} data={featuredProperties} />
                */}       
                </Box> 
                    </VStack>}
                    <VStack space={1}>
                        <Box px={5} mt={3} mb={1}>
                            <Text style={{ color: 'gray' }}>Recent Transactions</Text>
                        </Box>
                        {accountData.account_info.AccountNo && <TransactionHistory accountNo={accountData.account_info.AccountNo} navigation={navigation} />}
                    </VStack>

                </Box>
            </ScrollView>
        </Box>
    )
}

export default SavingsScreen;