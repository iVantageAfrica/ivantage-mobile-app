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



const InvestmentScreen = ({ navigation, route }) => {
    const { fetchData } = useAuthentication('getinvestments', 'get', navigation);
    const { fetchData: fetchInvestmentDetail } = useAuthentication('getinvestmentdetail', 'get', navigation);

    const [isLoading, setIsLoading] = useState(false)
    const [isCardLoading, setCardIsLoading] = useState(false)
    const [investments, setInvestments] = useState([])
    const [selectedInvestment, setSelectedInvestment] = useState(null)
    const [selectedInvestmentDetail, setSelectedInvestmentDetail] = useState(null)
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
            setSelectedInvestment(null)
            return
        }
        if (newSlide[0].item.accountNo) {
            setSelectedInvestment(newSlide[0])
            getInvestmentDetailData(newSlide[0].item.accountNo)
        }
    })

    useFocusEffect(useCallback(() => {
        getInvestments()
    }, []))

    const getInvestments = async () => {
        setIsLoading(true)
        await fetchData().then(res => {
            if (res && res.data.success) {
                if (res.data.data.length > 0) {
                    setInvestments(res.data.data)
                    setSelectedInvestment({ item: res.data.data[0] })
                    setSelectedInvestmentDetail(res.data.data[0])
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
        setIsLoading(false)
    }

    const getInvestmentDetailData = async (accountNo) => {
        setCardIsLoading(true)
        await fetchInvestmentDetail({
            params: { accountNumber: accountNo }
        }).then(res => {
            setCardIsLoading(false)
            if (res && res.data && res.data.success) {
                if (res.data.data.length > 0) {
                    setSelectedInvestmentDetail(res.data.data[0])
                }
                return
            }
            setSelectedInvestmentDetail(null)
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
        if (selectedInvestmentDetail && selectedInvestmentDetail.maturityAmount) {
            return selectedInvestmentDetail.maturityAmount
        }
        return 0.00
    }

    const renderInvestmentItem = ({ item, index }) => {
        return (
            <BigCard
                key={item.accountNo}
                label2_subtitle={'Maturity Amount'}
                label2_title={<Currency py={1} style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }} value={item.maturityAmount} />}
                label3_subtitle={'Interest Rate'}
                label3_title={`${(item.interestRate) ? item.interestRate : '--'}%`}
                label4_subtitle={'Principal Amount'}
                label4_title={<Currency value={item.investmentAmount} />}
                label5_subtitle={'Tenor'}
                label5_title={item.tenor}
                // label6_subtitle={'Last Funding'}
                // label6_title={'26th Apr. 2022'}
                label7_subtitle={'Maturity Date'}
                label7_title={item.maturityDate ? Utils.toHumanDate(item.maturityDate) : '--'}
                w={cardWidth}
                subtitleIcon={
                    <Image w={5} h={5} mt={2} source={Theme.Images.card_acc_no_icon} alt={'ivantage'} />}
                cardIcon={
                    <Image width={35} resizeMode="contain" source={Theme.Icons.investment_acc_icon} alt={'ivantage'} />}
                color={Theme.CustomTheme['card-green']} title={'Investment Account'} subtitle={item.accountNo} />
        )

    }

    if (isLoading) {
        return <Loader />
    }

    if ((!investments || investments.length == 0) && !isLoading) {
        return <Box style={{ ...styles.container }} mb={5} p={3}>
            <BigCardEmpty
                onButtonPress={() => goTo('investment_new')}
                onButtonText={'Open New Investment'}
                title={'No Investments'}
                subtitle={'You have no investment account created '}
                color={Theme.Colors.cardColorSecondary}
            />
        </Box>
    }

    return (
        <Box style={{ ...styles.container }} mb={5}>
            <VStack>
                {isCardLoading && <Box mt={3}>
                    <Text style={{ color: '#ffffff', textAlign: 'center' }}>Loading...</Text>
                </Box>}
                {investments && investments.length > 0 && <FlatList
                    mb={5}
                    ref={ref => { listRef = ref; }}
                    horizontal={true}
                    data={investments}
                    onLayout={() => {
                        if (listRef != null) {
                            //Need this for initial widget lazy render
                            listRef.recordInteraction();
                        }
                    }}
                    keyExtractor={item => item.accountNo}
                    initialScrollIndex={0.01}
                    renderItem={renderInvestmentItem}
                    snapToAlignment="center"
                    decelerationRate={"fast"}
                    getItemLayout={getItemLayout}
                    snapToInterval={cardWidth}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={_viewabilityConfig.current}
                />}
                <VStack px={7} mr={3} mb={5}>
                    <HStack w={'full'} space={3}>
                        <Box w={'1/3'} h={100} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                            <TouchableOpacity onPress={() => goTo('investment_new')} delayPressIn={0}>
                                <Center>
                                    <Image mb={3} mt={10} width={35} resizeMode="contain" source={Theme.Icons.new_investment} alt={'current'} />
                                    <Text mt={10} style={{ color: Theme.Colors.secondaryText, textAlign: 'center' }}>New Investment</Text>
                                </Center>
                            </TouchableOpacity>
                        </Box>
                        <Box w={'1/3'} h={100} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                            <TouchableOpacity disabled={!selectedInvestment} onPress={() => goTo('investment_add_to_deal')} delayPressIn={0}>
                                <Center>
                                    <Image mb={3} mt={5} width={35} resizeMode="contain" source={Theme.Icons.carbon_add} alt={'current'} />
                                    <Text style={{ color: Theme.Colors.secondaryText, textAlign: 'center' }}>Add To Deal</Text>
                                </Center>
                            </TouchableOpacity>
                        </Box>
                        <Box w={'1/3'} h={100} style={{ backgroundColor: Theme.Colors.backgroundColorAlt, borderRadius: 10 }}>
                            <TouchableOpacity disabled={!selectedInvestment} onPress={() => goTo('investment_liquidation_menu')} delayPressIn={0}>
                                <Center>
                                    <Image mb={3} mt={5} width={35} resizeMode="contain" source={Theme.Icons.liquidate_deal} alt={'current'} />
                                    <Text style={{ color: Theme.Colors.secondaryText, textAlign: 'center' }}>Liquidate Deal</Text>
                                </Center>
                            </TouchableOpacity>
                        </Box>
                    </HStack>
                </VStack>
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

export default InvestmentScreen;