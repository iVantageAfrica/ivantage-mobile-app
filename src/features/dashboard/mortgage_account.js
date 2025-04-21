import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import Utils from '../../common/utils'
import { View, TouchableOpacity, Dimensions } from 'react-native'
import { Box, VStack, HStack, Center, Link, WarningOutlineIcon, Input, Button, Text, Image, FlatList, ScrollView, Fade } from "native-base";
import BigCard from '../../components/bigcard'
import BigCardEmpty from '../../components/bigcard_empty'
import TransactionItem from '../../components/transactionitem'
import { useAuthentication } from "../../queries/useAuthentication";
import { useFocusEffect } from '@react-navigation/native'
import Currency from '../../components/currency'
import TransactionHistory from '../partials/transaction_history'

const { Transfer, RequestCard, AccountManager, Payment, PaymentHistory, BankStatement } = Theme.SVG

import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'



const MortgageScreen = ({ navigation, route }) => {
    const { fetchData } = useAuthentication('getmortgages', 'get', navigation);
    const { fetchData: fetchInvestmentDetail } = useAuthentication('getinvestmentdetail', 'get', navigation);

    const [isLoading, setIsLoading] = useState(false)
    const [isCardLoading, setCardIsLoading] = useState(false)
    const [mortgages, setMortgages] = useState([])
    const [selectedInvestment, setSelectedMortgage] = useState(null)
    const [selectedInvestmentDetail, setSelectedMortgageDetail] = useState(null)
    const _viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 20,
        waitForInteraction: true,
        minimumViewTime: 1
    })
    const cardWidth = Dimensions.get("window").width
    let listRef = useRef()
    const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
        const newSlide = changed.filter(t => t.isViewable)
        if (newSlide.length == 0) {
            setSelectedMortgage(null)
            return
        }
        setSelectedMortgage(newSlide[0])
        getMortgageDetailData(newSlide[0].item.mortgageAccountNumber)
    })

    useFocusEffect(useCallback(() => {
        getMortgages()
    }, []))

    const getMortgages = async () => {
        setIsLoading(true)
        await fetchData().then(res => {
            if (res && res.data.success) {
                if (res.data.data.length > 0) {
                    const mortgages = res.data.data.filter(f => f.status == 'approved' && f.mortgageAccountNumber)
                    setMortgages([...mortgages])
                } else {
                    setMortgages([])
                }

                return
            }
            AlertBox.showErrorEx(res);
            return
        }).catch(err => {
            AlertBox.showErrorEx(err);
            return
        })
        setIsLoading(false)
    }

    const getMortgageDetailData = async (accountNo) => {
        setCardIsLoading(true)
        await fetchInvestmentDetail({
            params: { accountNumber: accountNo }
        }).then(res => {
            setCardIsLoading(false)
            if (res && res.data && res.data.success) {
                setSelectedMortgageDetail(res.data.data)
                return
            }
            setSelectedMortgageDetail(null)
            // AlertBox.showErrorEx(res);
            return
        }).catch(err => {
            setCardIsLoading(false)
            AlertBox.showErrorEx(err);
            return
        })
    }

    const getItemLayout = (data, index) => (
        { length: cardWidth, offset: cardWidth * index, index }
    )

    const goTo = (menu) => {
        navigation.navigate(menu, { selectedInvestment })
    }

    const getDetailAmount = (item) => {
        if (selectedInvestmentDetail && selectedInvestmentDetail.outstandingBalance) {
            return selectedInvestmentDetail.outstandingBalance
        }
        return 0.00
    }

    const renderInvestmentItem = ({ item, index }) => {
        return (
            <BigCard
                key={item.accountNo}
                label2_subtitle={'Maturity Amount'}
                label2_title={<Currency py={1} style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }} value={getDetailAmount(item)} />}
                label3_subtitle={'Interest Rate'}
                label3_title={`${selectedInvestmentDetail && selectedInvestmentDetail.interestRate ? selectedInvestmentDetail.interestRate : '--'}%`}
                label4_subtitle={'Principal Amount'}
                label4_title={<Currency value={item.outstandingBalance} />}
                label5_subtitle={'Effective Date'}
                label5_title={Utils.toHumanDate(item.nextRepaymentDate)}
                // label6_subtitle={'Last Funding'}
                // label6_title={'26th Apr. 2022'}
                label7_subtitle={'Maturity Date'}
                label7_title={selectedInvestmentDetail && selectedInvestmentDetail.nextRepaymentDate ? Utils.toHumanDate(selectedInvestmentDetail.nextRepaymentDate) : '--'}
                w={cardWidth}
                subtitleIcon={
                    <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={'ivantage'} />}
                cardIcon={
                    <Image width={35} resizeMode="contain" source={Theme.Icons.investment_acc_icon} alt={'ivantage'} />}
                color={Theme.CustomTheme['card-green']} title={'Mortgage Account'} subtitle={item.accountNo} />
        )

    }

    if (isLoading) {
        return <Loader />
    }

    if ((!mortgages || mortgages.length == 0) && !isLoading) {
        return <Box style={{ ...styles.container }} mb={5} p={3}>
            <BigCardEmpty
                w={cardWidth}
                onButtonPress={() => goTo('PropertyScreen')}
                onButtonText={'Request New Mortgage'}
                title={'No Mortgage'}
                subtitle={'You have no Mortgage account created '}
                color={Theme.CustomTheme['card-green']}
            />
        </Box>
    }

    return (
        <Box style={{ ...styles.container }} mb={5}>
            <VStack>
                {isCardLoading && <Box mt={3}>
                    <Text style={{ color: '#ffffff', textAlign: 'center' }}>Loading...</Text>
                </Box>}
                {mortgages && mortgages.length > 0 && <FlatList
                    mb={5}
                    ref={ref => { listRef = ref; }}
                    horizontal={true}
                    data={mortgages}
                    onLayout={() => {
                        if (listRef != null) {
                            //Need this for initial widget lazy render
                            listRef.recordInteraction();
                        }
                    }}
                    keyExtractor={item => item.objectId}
                    initialScrollIndex={0.01}
                    renderItem={renderInvestmentItem}
                    snapToAlignment="center"
                    decelerationRate={"fast"}
                    getItemLayout={getItemLayout}
                    snapToInterval={cardWidth}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={_viewabilityConfig.current}
                />}
            </VStack>
            <VStack>
                <ScrollView>
                    <Box mb={70}>
                        <VStack space={1}>
                            <Box px={5}>
                                <Text style={{ color: 'gray' }}>Recent Transactions </Text>
                            </Box>
                            {!isCardLoading && selectedInvestment && selectedInvestment.item && selectedInvestment.item.accountNo && <TransactionHistory accountNo={selectedInvestment.item.accountNo} navigation={navigation} />}

                        </VStack>

                    </Box>
                </ScrollView>
            </VStack>


        </Box>
    )
}

export default MortgageScreen;