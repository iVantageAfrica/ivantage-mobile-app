import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native'
import { VStack, Button, Box, Image, Heading, Text, HStack, ScrollView, FlatList, Select, FormControl } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import Shared from '../../themes/shared';
import Theme from '../../themes';
import styles from './styles'
import Constants from 'expo-constants';
import { getAppConfig } from '../../common/device'
import Config from '../../common/config'

import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import TransactionHistory from '../partials/transaction_history'
import { useAuthentication } from "../../queries/useAuthentication";

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';


const { Transfer, RequestCard, AccountManager, Payment, PaymentHistory, BankStatement } = Theme.SVG

const TransactionHistoryScreen = ({ navigation, route }) => {
    const { fetchData: getAccounts } = useAuthentication('getbankaccounts', 'get', navigation);
    const { fetchData: getTransactionHistory } = useAuthentication('get_history', 'get', navigation);

    const displayName = getAppConfig().client_host_wallet_name

    const { defaultAccountNo = null } = route.params

    const [myaccounts, setMyAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState(defaultAccountNo)
    const [transactionHistory, setTransactionHistory] = useState([])
    const [fromdate, setFromDate] = useState((new Date()));
    const [todate, setToDate] = useState((new Date()));
    const [mode, setMode] = useState('from');
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getBankAccounts()
    }, [])


    const getBankAccounts = () => {
        setIsLoading(true)
        getAccounts({}).then(res => {
            setIsLoading(false)
            if (res && res.data && res.data.success) {
                setMyAccounts(res.data.data)
                if(defaultAccountNo) {
                    const defaultAccountCheck = (res.data?.data ?? []).filter(f => {
                        return f.account_info?.AccountNo === defaultAccountNo
                    })
                    if(!defaultAccountCheck?.length) {
                        setSelectedAccount(null)
                    }
                }
            }
        })
    }

    const getTransactionHistoryData = () => {
        if (!selectedAccount || !fromdate || !todate) {
            AlertBox.showError('Invalid filters selected. Try again')
            return
        }

        setIsLoading(true)
        getTransactionHistory({
            params: {
                accountNo: selectedAccount,
                startDate: fromdate,
                endDate: todate,
            }
        }).then(res => {
            setIsLoading(false)
            if (res && res.data && res.data.success) {
                setTransactionHistory(res.data.data)
                return
            }
            setTransactionHistory([])
            AlertBox.showErrorEx(res)
        })
    }

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(!show);
        if (mode == 'from') {
            setFromDate(currentDate);
        } else {
            setToDate(currentDate);
        }

    };

    const showMode = (currentMode) => {
        setShow(!show);
        setMode(currentMode);
    };

    const showDatepicker = (_mode) => {
        showMode(_mode);
    };

    const getDropItemLabel = (account) => {
        const lbl = Config().getLabel(account.account_type)
        return `${lbl} Account - ${account.account_info.AccountName}(${account.account_info.AccountNo})`
    }

    if (isLoading) {
        return <Loader />
    }

    return (<VStack style={{ ...styles.container }}>

        {!defaultAccountNo && <VStack>
            <HStack p={3}>
                <Box w={'5/6'}>
                    <FormControl isRequired>
                        <FormControl.Label type={'Email'} _text={{
                            color: "#ffffff",
                            fontWeight: "medium",
                            fontSize: "sm"
                        }}>Select Account</FormControl.Label>
                        <Select w={'full'} onValueChange={(v) => {
                            setSelectedAccount(v)
                        }} placeholder={'Select Account'} bgColor={'#ffffff'} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                            {myaccounts && myaccounts.map(y => <Select.Item key={y.objectId} isDisabled={y.account_info.AccountStatus == 'PENDING'} label={getDropItemLabel(y)} value={y.account_info.AccountNo} />)}
                        </Select>
                    </FormControl>
                </Box>
                <Box ml={3} pt={8}>
                    <Button style={Shared.Button.primary} variant={'solid'} onPress={getTransactionHistoryData} ><Icon color="white" as={<FontAwesome name={'search'} />} size="sm" /></Button>
                </Box>
            </HStack>

        </VStack>}
        <VStack mt={2} mx={2} style={{ borderBottomWidth: 1, borderBottomColor: '#000000' }}>
            <HStack mb={2} justifyContent={'space-between'}>
                <Button mr={1} ml={1} variant={'ghost'} onPress={() => showDatepicker('from')}>
                    <HStack space={1}>
                        <Icon color="white" as={<FontAwesome name={'calendar'} />} size="sm" />
                        <Text style={{ color: '#ffffff' }}>From: {fromdate.toDateString()}</Text>
                    </HStack>
                </Button>
                <Button mr={1} variant={'ghost'} onPress={() => showDatepicker('to')}>
                    <HStack space={1}>
                        <Icon color="white" as={<FontAwesome name={'calendar'} />} size="sm" />
                        <Text style={{ color: '#ffffff' }}>To: {todate.toDateString()}</Text>
                    </HStack>
                </Button>
            </HStack>

        </VStack>
        <VStack mb={90}>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    display={Platform.OS == 'ios' ? 'inline' : 'default'}
                    value={(new Date())}
                    mode={'date'}
                    is24Hour={true}
                    onChange={onChange}
                />
            )}
            <ScrollView contentInset={{ bottom: 100 }}>
                {selectedAccount && <TransactionHistory fromDate={fromdate} toDate={todate} accountNo={selectedAccount} navigation={navigation} />}
            </ScrollView>
        </VStack>

    </VStack>)
}

export default TransactionHistoryScreen