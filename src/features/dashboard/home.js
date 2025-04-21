import React, { useState, useCallback } from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import { Box, VStack, HStack, Center, FormControl, Link, ScrollView, Input, Button, Heading, Image, Text, FlatList } from "native-base";
import { useFocusEffect } from '@react-navigation/native'

import Card from '../../components/card'
import Profile from '../../components/profile'
import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import BillCard from '../../components/billcard';
import AffiliateCard from '../../components/affiliate_card';


const AccountTypesStruct = {
    IVANTAGE: 'ivantage',
    CURRENT: 'current'
}

const HomeScreen = ({ navigation }) => {
    const { fetchData: getAccounts } = useAuthentication('getbankaccounts', 'get', navigation);
    const { fetchData: getAccountTypes } = useAuthentication('getaccounttypes', 'get', navigation);
    const { fetchData: fetchInvestments } = useAuthentication('getinvestments', 'get', navigation);
    const [accounts, setAccounts] = useState([])
    const [accountTypes, setAccountTypes] = useState({})
    const [userAccountMap, setUserAccountMap] = useState({})
    const [investments, setInvestments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasAccount, setHasAccount] = useState(false)

    const { authData } = useUser();

    //getAccounts
    useFocusEffect(useCallback(() => {
        loadAccountInfo()
        getInvestments()
        checkBVNVerificationRequired()
    }, []))

    const loadAccountInfo = async () => {
        setIsLoading(true)
        await getBankAccountTypes().then(getUserBankAccounts)
        setIsLoading(false)
    }

    const checkBVNVerificationRequired = () => {
        if(authData && authData.user && !authData.user.bvnVerified && hasAccount) {
            AlertBox.confirmBox('You need to verify your BVN to keep your accounts active.',
             () => {
                navigation.navigate('BVNValidationScreen', {})
             }, ()=> {}, 'BVN Validation Required', { okText: 'Validate BVN', cancelText: 'Not Now'})
        }
    }

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
        return getAccounts().then(res => {
            if (res && res.data && res.data.success) {
                res.data.data.map((item) => {
                    if (item.account_type in accountMap) {
                        setHasAccount(true)
                        accountMap[item.account_type].userAccount = item
                    }
                })
                setAccountTypes(accountMap)
                return
            }
            AlertBox.showErrorEx(res);
        }).catch(err => {
            AlertBox.showErrorEx(err);
        })
    }

    const getBankAccountTypes = async () => {
        return getAccountTypes().then(res => {
            if (res && res.data && res.data.success) {
                const accountMap = {}
                res.data.data.forEach(item => {
                    accountMap[item.name] = item
                });

                return accountMap
            }
            AlertBox.showErrorEx(res);
            return {}
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return {}
        })
    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <ScrollView style={{ ...styles.container }}>
            <Box safeArea mt={3} mb={90}>
                <Box  px="2" w="full" >
                    <Profile navigation={navigation} userData={authData} />
                    <VStack>
                        <Box mt={1} px={3}>
                            <Text style={{ color: 'gray', fontSize: 18 }}>Accounts</Text>
                        </Box>
                        {accountTypes && Object.values(accountTypes).map((accountData, indx) => {
                            if (!accountData.userAccount) {
                                return (
                                    <Card
                                        key={indx}
                                        data={accountData}
                                        w={'full'}
                                        subtitleIcon={
                                            <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={'no account'} />}
                                        cardIcon={
                                            <Image width={35} resizeMode="contain" source={Theme.Icons.ivantage_acc_icon} alt={'no account'} />}
                                        color={Theme.CustomTheme['card-orange']} title={`${accountData.label}`} actionBtn={<HStack justifyContent={'space-between'} space={3}>
                                            {accountData.name != AccountTypesStruct.IVANTAGE && <Button
                                                onPress={() => navigation.navigate('AddAccountScreen', { accountType: accountData.name, accountTypeLabel: accountData.label , authData })}
                                                mt="4" _text={{color:'#ffffff'}} ml={5} variant={'ghost'} size={'sm'} style={{ ...Shared.Button.primary_outline_white, alignSelf: 'flex-end' }} >
                                                Add Existing Account
                                                </Button>}
                                                <Button
                                                onPress={() => navigation.navigate('CreateAccountScreen', { accountType: accountData.name, accountTypeLabel: accountData.label, authData })}
                                                mt="4" variant={'solid'} ml={5} mr={5}  size={'sm'} style={{ ...Shared.Button.primary, alignSelf: 'flex-end' }} >
                                                Create Account
                                                </Button>
                                        </HStack>} />
                                )
                            }
                            return (
                                <Card
                                    onPress={(e) => {
                                        navigation.navigate('AccountDetail', { params: accountData, screen: accountData.name === AccountTypesStruct.IVANTAGE? accountData.name: AccountTypesStruct.CURRENT })
                                    }}
                                    key={indx}
                                    data={accountData}
                                    w={'full'}
                                    subtitleIcon={
                                        <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={accountData.name} />}
                                    cardIcon={
                                        <Image width={35} resizeMode="contain" source={accountData.name == AccountTypesStruct.IVANTAGE ? Theme.Icons.ivantage_acc_icon : Theme.Icons.current_acc_icon} alt={accountData.name} />}
                                    color={Theme.CustomTheme['card-orange']} title={`${accountData.label}`} subtitle={accountData.userAccount.account_info.AccountNo} />
                            )
                        })}


                    </VStack>
                </Box>
                <AffiliateCard navigation={navigation} />
                <BillCard navigation={navigation}/>
                <Box mt={3} px={3}>
                    <Text style={{ color: 'gray', fontSize: 18 }}>Personal Investments</Text>
                </Box>
                {(!investments || investments.length == 0) && <Box  px={2} w={Shared.DeviceDimensions.WIDTH}>
                    <Card
                        w={Shared.DeviceDimensions.WIDTH - 20}
                        maxW={Shared.DeviceDimensions.WIDTH - 20}
                        onPress={(e) => {
                            navigation.navigate('AccountDetail', { params: {}, screen: 'investment' })
                        }}
                        // w={'full'}
                        subtitleIcon={
                            <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={'ivantage'} />}
                        cardIcon={
                            <Image width={35} mt={3} resizeMode="contain" source={Theme.Icons.diamond} alt={'ivantage'} />}
                        color={Theme.CustomTheme['card-green']} title={`New Investment Account`} subtitle={`Create investment account to enjoy the best interest rates`}
                        actionBtn={<Box>
                            <Button
                                onPress={() => navigation.navigate('AccountDetail', { params: {}, screen: 'investment' })}
                                mt="4" mr={5} variant={'solid'} w={150} size={'sm'} style={{ ...Shared.Button.primary, alignSelf: 'flex-end' }} >
                                Create Investment
                                </Button>
                        </Box>}
                    />
                </Box>}
                {investments && investments.length > 0 && <FlatList  maxW={Shared.DeviceDimensions.WIDTH} w={Shared.DeviceDimensions.WIDTH} horizontal={true} data={investments} renderItem={({ item, index }) => {
                    return (<Card
                        onPress={(e) => {
                            navigation.navigate('AccountDetail', { params: { item, index }, screen: 'investment' })
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
                {/* <Box px="2" w="full">
                        <VStack>
                            <Card
                                w={'full'}
                                subtitleIcon={
                                    <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={'ivantage'} />}
                                cardIcon={
                                    <Image width={35} resizeMode="contain" source={Theme.Icons.home_mortgage} alt={'ivantage'} />}
                                color={Theme.CustomTheme['card-yellow']} title={'Mortgage Account'} subtitle={'23454334'} />
                        </VStack>
                    </Box> */}
            </Box>

        </ScrollView>
    )
}

export default HomeScreen;