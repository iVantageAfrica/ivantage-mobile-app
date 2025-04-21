import React, { useEffect, useState, useCallback } from 'react';
import styles from './styles'
import utils from '../../common/utils'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { FlatList, View, TouchableOpacity } from 'react-native'
import { Box, VStack, HStack, Center, Link, WarningOutlineIcon, Input, Button, Text, Image, ScrollView } from "native-base";

import TransactionItem from '../../components/transactionitem'
import { useAuthentication } from "../../queries/useAuthentication";

import { useFocusEffect } from '@react-navigation/native'
import Currency from '../../components/currency'

import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import EmptyList from '../../components/emptylist'


const AccountHistoryView = ({ navigation, accountNo, fromDate, toDate }) => {
    const { fetchData: fetchAccountHistory } = useAuthentication('get_history', 'get', navigation, false);

    const [transactions, setTransactions] = useState([])
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const _toDate = utils.toYMD(toDate || new Date())
        const _fromDate = fromDate !== undefined ? utils.toYMD(fromDate) : utils.addMonths(new Date(), -1)
        setStartDate(_fromDate)
        setEndDate(_toDate)
        if (accountNo) {
            getHistory(_fromDate, _toDate)
        }
    }, [accountNo, fromDate, toDate])

    const getHistory = (sDate, eDate) => {
        setIsLoading(true)
        fetchAccountHistory({
            params: {
                accountNo,
                startDate: sDate,
                endDate: eDate
            }
        })
            .then(resp => {
                setIsLoading(false)
                if (resp && resp.data && resp.data.success) {
                    setTransactions(resp.data.data.transHistory)
                    return
                }
                setTransactions([])
            }).catch(e => {
                setIsLoading(false)
                AlertBox.showErrorEx(e)
            })
    }

    const renderItem = ({ item, index }) => {
        return <TransactionItem navigation={navigation} transaction={item} key={index} is_credit={item.transactionType == 'C'} amount={<Currency value={item.amount} />} title={`${item.refAccountNo} - ${item.transactionNarration}`} subtitle={utils.toHumanDate(item.transactionDate)} w={'full'} mb={2} style={{ backgroundColor: '#415367' }} />
    }

    if (!isLoading && (!transactions || transactions.length == 0)) {
        return (<EmptyList message={'No Transaction History'} />)
    }

    if (isLoading) {
        return (<EmptyList message={'Loading...'} />)
    }

    return (<View style={{ paddingBottom: 10, marginBottom: 150 }}>
        {transactions && transactions.length > 0 && (transactions.map((transaction, index) => {
            return renderItem({ item: transaction, index })
        }))}
    </View>)
}

export default AccountHistoryView