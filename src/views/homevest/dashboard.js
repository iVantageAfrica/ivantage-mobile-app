import React, { useState, useCallback, useEffect } from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import { Box, VStack, HStack, Center, FormControl, Link, ScrollView, Input, Button, Select, Image, Text, FlatList, Icon, IconButton, Flex, Spacer, Skeleton, Progress, Actionsheet, Checkbox, useDisclose } from "native-base";
import { useFocusEffect } from '@react-navigation/native'
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from "expo-clipboard";
import { Modal } from "native-base";

import AlertBox from '../../components/alertbox';
import Currency from '../../components/currency';
import { TouchableOpacity } from 'react-native';
import DateLabel from '../../components/datelabel';
import themes from '../../themes';


const HomeVestDashboardScreen = ({ navigation, route }) => {

    const { fetchData: fetchAccountBalance } = useAuthentication('getaccountbalance', 'get', navigation, false);
    const { fetchData: fetchSavingsPlanAPI } = useAuthentication('homevest_savings_plan', 'get', navigation, false);

    const [showModal, setShowModal] = useState(false);

    const statusMap = {
        pending: 'Ongoing',
        completed: 'Completed'
    }

    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclose();

    const {
        isOpen: isOptionOpen,
        onOpen: onOptionOpen,
        onClose: onOptionClose
    } = useDisclose();

    useFocusEffect(useCallback(() => {
        onClose()
    }, []))

    const routePlan = route.params.plan
    const dueDate = routePlan?.savings_entries?.length ? routePlan?.savings_entries[routePlan.tenor - 1]?.due_date : null
    const monthlyContributionAmt = routePlan?.savings_entries?.length ? routePlan?.savings_entries[0]?.amount : 0

    if (!routePlan?.savings_entries?.length) {
        routePlan.savings_entries = []
    }

    const [plan, setPlan] = useState(routePlan)
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [displayAccountBalance, setDisplayAccountBalance] = useState(false)
    const [accountBalanceInfo, setAccountBalanceInfo] = useState(null)
    const [acctLoading, setAcctLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [totalCount, setTotalCount] = useState(0)
    const [completedCount, setCompletedCount] = useState(0)
    const [pendingCount, setPendingCount] = useState(0)
    const [maturityDate,] = useState(dueDate)
    const [progress, setProgress] = useState(0)
    const [monthlyContribution,] = useState(Number(monthlyContributionAmt))
    const [nextDueDate, setNextDueDate] = useState(null)

    //getAccounts
    useFocusEffect(useCallback(() => {
        fetchSavingsPlan(true)
    }, []))

    useEffect(() => {
        fetchSavingsPlan()
        getNextDue(plan)
    }, [])

    const fetchSavingsPlan = async (in_background) => {
        if (!in_background) {
            setIsLoading(true)
        }

        return fetchSavingsPlanAPI({
            urlParams: {
                savingsPlan_id: plan.id
            }
        }).then(async (res) => {
            setIsLoading(false)
            if (res && res.data && res.data.success) {
                const _plan = Array.from(res.data?.data).find(f => f.id === plan.id) // Temporary
                setPlan(_plan)
                getProgress(_plan)
                await getAccountBalance(plan.debit_account_number)
                return
            }
            AlertBox.showErrorEx(res);
        }).catch(err => {
            AlertBox.showErrorEx(err);
        })
    }

    const getProgress = (plan) => {
        const total = plan.savings_entries.length
        const completed = plan.savings_entries.filter(f => f.status !== 'pending').length
        const progress = Math.min((completed / total) * 100, 100);
        setTotalCount(total)
        setCompletedCount(completed)
        setPendingCount(total - completed)
        setProgress(progress < 3 ? 3 : progress)
    }

    const getNextDue = (plan) => {
        const schedule = Array.from(plan?.savings_entries).find(s => s.status === 'pending') // Temporary
        setNextDueDate(schedule?.due_date)
    }

    const getAccountBalance = async (accountNo) => {
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

    const goTo = (slug, item = {}) => {
        navigation.navigate(slug, item)
    }

    const copyToClipboard = async (accountNo) => {
        if (!accountNo) { return }
        await Clipboard.setStringAsync(accountNo);
        AlertBox.showSuccess(`Homevest Account number (${accountNo}) copied successfully.`, "Copied");
    };

    return (<ScrollView mb={5}>
        <Box bg={Theme.Colors.backgroundColorAlt3} borderWidth={1} borderColor={Theme.Colors.backgroundColorAlt} mx={5} borderRadius={10}>
            <Box>
                <Flex direction='row' justify='space-between'>
                    <Box mx={5} my={5} _text={{ fontSize: 16, color: '#ffffff', fontWeight: 'extrabold' }}>My Homvest</Box>
                    <Box>
                        <TouchableOpacity onPress={() => copyToClipboard(plan.debit_account_number)}>
                            <Box m={5} p={2} bg={Theme.Colors.backgroundColorAlt2} style={{ borderRadius: 10 }}>
                                <HStack space={1} >
                                    <Text color={'#ffffff'}>
                                        {plan.debit_account_number ?? 'Processing'}
                                    </Text>
                                    <IconButton icon={<Icon size={14} color={'orange.100'} as={FontAwesome} name={'copy'} />} size={4} variant={'ghost'} />
                                </HStack>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Flex>
            </Box>
            <Box>
                <Box mx={5} h={90}>

                    {!acctLoading && <Box >
                        <HStack >
                            {displayAccountBalance && <Currency fontSize={25} color={Theme.Colors.backgroundColorLight} fontWeight={'extrabold'} value={accountBalanceInfo?.availableBalance ?? 0.00} />}
                            {!displayAccountBalance && <Text fontSize={25} color={Theme.Colors.backgroundColorLight} fontWeight={'extrabold'}>* * * * * * * * * * * *</Text>}
                            <IconButton onPress={() => setDisplayAccountBalance(!displayAccountBalance)} ml={5} mt={2} icon={<Icon size={23} color={Theme.Colors.backgroundColorLight} as={FontAwesome} name={!displayAccountBalance ? 'eye-slash' : 'eye'} />} size={4} variant={'ghost'} />
                        </HStack>
                    </Box>}
                    {!acctLoading && <Box mt={2}>
                        <HStack>
                            <Text fontSize={12} mr={2} color={Theme.Colors.backgroundColorLight}>Savings Target</Text>
                            {displayAccountBalance && <Currency fontSize={12} color={Theme.Colors.backgroundColorLight} fontWeight={'bold'} value={Number(plan.equity_amount)} />}
                            {!displayAccountBalance && <Text fontSize={12} color={Theme.Colors.backgroundColorLight} fontWeight={'bold'} >* * * * * * * * * * * *</Text>}
                        </HStack>
                    </Box>}
                    <Box>
                        {acctLoading && <Skeleton.Text startColor="orange.100" mt={2} />}
                    </Box>

                </Box>
            </Box>
            <Box bg={Theme.Colors.backgroundColorAlt2} h={100}>
                <Flex direction='row' justifyContent="space-between">
                    <Box flex={1} >
                        <TouchableOpacity onPress={() => {
                            if (!plan?.debit_account_number) {
                                AlertBox.showError('This request is still being processed. Kindly check again later.', 'Request Pending')
                            } else {
                                onOptionOpen()
                            }
                        }} delayPressIn={0}>
                            <Center>
                                <Image mt={3} width={35} resizeMode="contain" source={Theme.Icons.browse_property} alt={'current'} />
                                <Text fontSize={11} style={{ color: '#ffffff', textAlign: 'center' }}>Top up Homevest</Text>
                            </Center>
                        </TouchableOpacity>
                    </Box>
                    <Box flex={1} >
                        <TouchableOpacity onPress={() => navigation.navigate('homevest.properties', { mode: 'view' })} delayPressIn={0}>
                            <Center>
                                <Image mt={3} width={35} resizeMode="contain" source={Theme.Icons.browse_property} alt={'Properties'} />
                                <Text fontSize={11} style={{ color: '#ffffff', textAlign: 'center' }}>Properties</Text>
                            </Center>
                        </TouchableOpacity>
                    </Box>
                    <Box flex={1}>
                        <TouchableOpacity onPress={() => setShowModal(true)} delayPressIn={0}>
                            <Center>
                                <Image mt={3} width={35} resizeMode="contain" source={Theme.Icons.browse_property} alt={'Properties'} />
                                <Text fontSize={11} style={{ color: '#ffffff', textAlign: 'center' }}>Terminate</Text>
                            </Center>
                        </TouchableOpacity>
                    </Box>
                </Flex>
            </Box>
        </Box>
        <Box mt={25} bg={Theme.Colors.backgroundColorAlt3} mx={5}>
            <Box>
                <Flex direction='row' justify='space-between'>
                    <Box mx={5} my={5} _text={{ fontSize: 16, color: '#ffffff', fontWeight: 'extrabold' }}>Your Progress</Box>
                    <Box>
                        <Box m={3} p={1} bg={Theme.Colors.backgroundColorAlt} style={{ borderRadius: 10 }}>
                            <Text mx={2} fontSize={11} color={'orange.200'} fontWeight={'bold'}>
                                {statusMap[plan.status] ?? 'Ongoing'}
                            </Text>
                        </Box>
                    </Box>
                </Flex>
            </Box>
            <Box mt={5}>
                <TouchableOpacity onPress={() => {
                    if (!plan?.debit_account_number) { return }
                    onOpen()
                }}>
                    <Box >
                        <Progress size="xl" colorScheme="emerald" value={progress} mx="4" />
                    </Box>
                </TouchableOpacity>
                <Box mx={5} my={3}>
                    <Flex direction='row'  justifyContent="space-between">
                        <Box >
                            <Text fontSize={11} color={'amber.100'}>{completedCount} of {plan.tenor} months (fixed)</Text>
                        </Box>
                        <Box  >
                            <Currency fontSize={11} color={'amber.100'} HLabel={'Equity - '} value={Number(plan.equity_amount) + Number(plan.upfront_payment || 0.00) } />
                        </Box>

                    </Flex>

                </Box>
            </Box>
        </Box>
        {plan.payment_schedule_status !== 'pending' && <Box mt={25} bg={Theme.Colors.backgroundColorAlt3} mx={5}>
            <Box>
                <Box mx={5} mt={5} _text={{ fontSize: 11, color: '#ffffff' }}>Minimum monthly savings</Box>
            </Box>
            <Box mx={5} my={3}>
                <Currency fontSize={15} fontWeight={'extrabold'} color={'amber.100'} value={monthlyContribution} />
            </Box>
        </Box>}
        {plan.upfront_payment && <Box mt={25} bg={Theme.Colors.backgroundColorAlt3} mx={5}>
            <Box>
                <Box mx={5} mt={5} _text={{ fontSize: 11, color: '#ffffff' }}>Upfront Payment</Box>
            </Box>
            <Box mx={5} my={3}>
                <Currency fontSize={15} fontWeight={'extrabold'} color={'amber.100'} value={Number(plan.upfront_payment || 0.00)} />
            </Box>
        </Box>}
        <Box mt={25} bg={Theme.Colors.backgroundColorAlt3} mx={5}>
            <Box>
                <Box mx={5} mt={5} _text={{ fontSize: 11, color: '#ffffff' }}>Property Target</Box>
            </Box>
            <Box mx={5} my={3}>
                <Currency fontSize={15} fontWeight={'extrabold'} color={'amber.100'} value={(Number(plan.property_value))} />
            </Box>
        </Box>
        <Box mx={5}>
            <Flex direction='row' justifyContent="space-between">
                <Box flex={1} mt={25} py={5} px={5} bg={Theme.Colors.backgroundColorAlt3} >
                    <Flex direction='row'>
                        <Box>
                            <Image mr={2} width={35} resizeMode="contain" source={Theme.Icons.browse_property} alt={'Tenor'} />
                        </Box>
                        <Box mt={2} >
                            <Box _text={{ fontSize: 11, color: '#ffffff' }}>Tenor end date</Box>
                            <Box>
                                <DateLabel showLastDay={true} color={'#ffffff'} value={maturityDate} fontSize={15} />
                            </Box>
                        </Box>
                    </Flex>
                </Box>
                <Box flex={1} mt={25} py={5} px={5} bg={Theme.Colors.backgroundColorAlt3} >
                    <Flex direction='row'>
                        <Box>
                            <Image mr={2} width={45} resizeMode="contain" source={Theme.Icons.browse_property} alt={'Tenor'} />
                        </Box>
                        <Box mt={2} >
                            <Box _text={{ fontSize: 11, color: '#ffffff' }}>Next Due Date</Box>
                            <Box>
                                <DateLabel showLastDay={true} color={'#ffffff'} value={nextDueDate} fontSize={15} />
                            </Box>
                        </Box>
                    </Flex>
                </Box>
            </Flex>
        </Box>
        {plan.debit_account_number && <Box mt={10} mb={10} mx={5}>
            <Flex>
                <Button size={'lg'} _text={{ color: 'amber.100', fontWeight: 'extrabold' }} borderColor={'amber.600'} variant={'outline'} onPress={() => goTo('TransactionHistoryScreen', { defaultAccountNo: selectedAccount })}>See Transactions</Button>
            </Flex>
        </Box>}
        <Actionsheet isOpen={isOptionOpen} onClose={onOptionClose}>
            <Actionsheet.Content style={{ backgroundColor: '#f9f9f9' }} >
                <Box mb={7} w="100%" px={4} justifyContent="center">
                    <Box><Text textAlign={'center'} fontSize={'2xl'} fontWeight={'extrabold'} color={'#000000'}>
                        TopUp Options
                    </Text></Box>
                    <Box mt={3}>
                        <Text textAlign={'center'} fontSize="16" color="gray.500" _dark={{
                            color: "gray.300"
                        }}>
                            Select a top-up option to fund your Homevest account.
                        </Text>
                    </Box>
                    <Box mt={3}>
                        <VStack>
                            <Box p={5} bg={Theme.CustomTheme['light-orange-background']} style={{ borderRadius: 10 }}>
                                <Text>Your Homevest Account</Text>
                                <TouchableOpacity onPress={() => copyToClipboard(plan.debit_account_number)}>
                                    <Box w={'100%'}>
                                        <HStack space={1} >
                                            <Text fontSize={30} fontWeight={'extrabold'} >
                                                {plan.debit_account_number}
                                            </Text>
                                            <IconButton icon={<Icon size={14} color={'orange.700'} as={FontAwesome} name={'copy'} />} size={4} variant={'ghost'} />
                                        </HStack>
                                        <Box mt={3}>
                                            <Text>Bank Name</Text>
                                            <Text fontWeight={'bold'}>Imperial Homes Mortgage Bank</Text>
                                        </Box>
                                    </Box>
                                </TouchableOpacity>
                                <Box mt={5}>
                                    <Text>*Transfers to the account above automatically credits your Homevest account.</Text>
                                </Box>
                            </Box>
                            <Box mt={3} mb={3}>
                                <Text textAlign={'center'} fontWeight={'bold'}>OR</Text>
                            </Box>
                            <Box mb={5}>
                                <Button style={Shared.Button.primary_outline_no_radius} onPress={() => {
                                    onOptionClose()
                                    goTo('savings_tranfers_to_own_acct')
                                }} _text={{ color: 'red.600' }} variant={'outline'}>Top-up From Your Imperial Account</Button>
                            </Box>
                        </VStack>
                    </Box>
                </Box>
            </Actionsheet.Content>
        </Actionsheet>
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{ backgroundColor: '#f9f9f9', paddingBottom: 120 }} >
                <Box mb={7} w="100%" py={3} px={4} justifyContent="center">
                    <Box><Text textAlign={'center'} fontSize={'2xl'} fontWeight={'extrabold'} color={'#000000'}>
                        Contribution Schedules
                    </Text></Box>
                    <Box mt={3}>
                        <Text textAlign={'center'} fontSize="16" color="gray.500" _dark={{
                            color: "gray.300"
                        }}>
                            *Price range depends on available construction projects
                        </Text>
                    </Box>
                </Box>
                {plan.savings_entries.length > 0 && <Box w="100%" marginBottom={50} >
                    <ScrollView >
                        {plan.savings_entries.map(schedule => {
                            return (
                                <Box style={{ ...styles.checkItem, padding: 10, height: 50 , flexWrap:'wrap' }} pt={3} w={'full'} key={schedule.id}>
                                    <Checkbox isChecked={schedule.status !== 'pending'} colorScheme="green">
                                        <Currency value={Number(schedule.amount)} />
                                        <Text>due on</Text>
                                        <DateLabel showLastDay={true} value={schedule.due_date} />
                                        <Text>for Month {schedule.month_number}</Text>
                                    </Checkbox>
                                </Box>
                            )
                        })}
                    </ScrollView>
                </Box>}
            </Actionsheet.Content>
        </Actionsheet>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} safeAreaTop={true}>
            <Modal.Content >
                <Modal.CloseButton />
                <Modal.Header>Termination Policy</Modal.Header>
                <Modal.Body>
                    <Text>
                        Are you sure you want to terminate this Homevest plan?
                    </Text>
                </Modal.Body>
                <Modal.Footer>
                    <Button.Group space={2}>
                        <Button variant="ghost" onPress={() => {
                            setShowModal(false);
                        }}>
                            Cancel
                        </Button>
                        <Button bgColor={Theme.Colors.backgroundColorAlt2} onPress={() => {
                            setShowModal(false);
                        }}>
                            Yes, Proceed
                        </Button>
                    </Button.Group>
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    </ScrollView>)
}

export default HomeVestDashboardScreen