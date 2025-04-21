import React, { useCallback, useEffect, useRef, useState } from 'react';
import Theme from '../../themes';
import Shared from '../../themes/shared';
import styles from './styles'

import { Box, VStack, Text, Button, Actionsheet, useDisclose, ScrollView, HStack, Radio, Icon, FormControl, Stack, Input, Switch, Divider, Flex, Select, Spinner, AlertDialog, Link } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthentication } from '../../queries/useAuthentication';
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader';
import Currency from '../../components/currency';
import { TouchableOpacity } from 'react-native';
import CurrencyInput from 'react-native-currency-input';

const CreateHomeVestScreen = ({ navigation, route }) => {
    const { fetchData: fetchHomeVestRangeApi } = useAuthentication('homevest_range', 'get', navigation, false);
    const { fetchData: fetchHomeVestTenorApi } = useAuthentication('homevest_tenor', 'get', navigation, false);
    const { fetchData: createHomeVestPlanApi } = useAuthentication('homevest_savings_plan', 'post', navigation, false);
    const { fetchData: fetchHomeVestLocationApi } = useAuthentication('homevest_location', 'get', navigation, false);

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [offerOptions, setOfferOptions] = useState([])
    const [tenorOptions, setTenorOptions] = useState([])
    const [locationOptions, setLocationOptions] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [selectedTenorIndex, setSelectedTenorIndex] = useState(0)
    const [selectedOfferOption, setSelectedOfferOption] = useState(-1)
    const [equityContribution, setEquityContribution] = useState(0)
    const [minimumEquityContribution, setMinimumEquityContribution] = useState(10)
    const [mortageRequired, setMortgageRequired] = useState(0)
    const [monthlyContribution, setMonthlyContribution] = useState(0)
    const [monthlyNewIncome, setMonthlyNetIncome] = useState(0)
    const [hasRSAIncome, setHasRSAIncome] = useState(false)
    const [hasOtherIncome, setOtherIncome] = useState(false)
    const [upfrontPayment, setUpfrontPayment] = useState(0.00)
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const cancelConfirmRef = useRef(null);

    const onConfirmClose = () => setConfirmOpen(false);

    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclose();

    const {
        isOpen: isLocationOptionOpen,
        onOpen: onLocationOptionOpen,
        onClose: onLocationOptionClose
    } = useDisclose();

    useFocusEffect(useCallback(() => {
        onLocationOptionClose()
        onOpen()
    }, []))

    useEffect(() => {
        computeRequiredValues(selectedOfferOption)
    }, [minimumEquityContribution, selectedOfferOption, selectedTenorIndex, upfrontPayment]);

    useEffect(() => {
        fetchHomeVestRange();
        fetchHomeVestTenor();
        fetchLocationInformation();
    }, []);

    const createHomevestPlan = async () => {
        if (Number(minimumEquityContribution) < 10) {
            AlertBox.showError('Personal contribution cannot be less than 10%', 'Validation Error')
            return
        }
        if (Number(mortageRequired) <= 0) {
            AlertBox.showError('Expects mortgage amount to be more than zero.', 'Validation Error')
            return
        }
        if (Number(monthlyNewIncome) <= 0) {
            AlertBox.showError('Monthly income is expected to be greater than zero.', 'Validation Error')
            return
        }
        if (!tenorOptions[selectedTenorIndex]?.length || Number(mortageRequired) <= 0) {
            AlertBox.showError('Form is not properly filled. Kindly fill this properly and try again.', 'Validation Error')
            return
        }
        const dateValue = new Date()
        const startDate = new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 0)
        const payload = {
            startDate: startDate.toISOString(),
            mortgageAmount: mortageRequired,
            percentageEquity: minimumEquityContribution,
            tenor: tenorOptions[selectedTenorIndex].length,
            monthlyEarnings: Number(monthlyNewIncome),
            rsaAccountAvailable: hasRSAIncome,
            upfrontPayment: Number(upfrontPayment),
            upfrontEarningsAvailable: hasOtherIncome,
            propertyRangeId: offerOptions[selectedOfferOption]?.identifier,
            locationId: selectedLocation,
            propertyValue: Number(offerOptions[selectedOfferOption]?.max_value),
        }

        if (isNaN(payload.upfrontPayment) || payload.upfrontPayment <= 0) {
            delete payload.upfrontPayment
        }

        setIsLoading(true)
        setIsSubmitting(true)
        createHomeVestPlanApi(payload).then(async (res) => {
            setIsLoading(false)
            setIsSubmitting(false)
            if (res?.data?.success) {
                AlertBox.showSuccess(res.data?.message || "Homevest savings plan created successfully.")
                navigation.reset({
                    index: 1,
                    routes: [{ name: 'Home' }, { name: 'homevest.dashboard', params: { plan: res.data?.data } }],
                });
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            console.log(err)
            setIsLoading(false)
            setIsSubmitting(false)
            AlertBox.showErrorEx(err)
        })
    }

    const fetchLocationInformation = async () => {
        const locationInfo = await fetchHomeVestLocationApi({})
        if (locationInfo?.data?.success) {
            setLocationOptions(locationInfo.data.data)
        } else {
            setLocationOptions([])
        }
    }

    const computeRequiredValues = (idx) => {
        if (idx < 0) { return }
        const option = offerOptions[idx]
        const computedEquityContribution = (minimumEquityContribution / 100) * option.max_value
        if (upfrontPayment >= computedEquityContribution) {
            AlertBox.showError('Upfront payment cannot be more than the equity contribution.', 'Validation Error')
            setUpfrontPayment(0)
            return
        }
        const new_computedEquityContribution = computedEquityContribution - upfrontPayment
        const computedMortgageRequired = option.max_value - computedEquityContribution
        const computedMonthlyContribution = new_computedEquityContribution

        setMonthlyContribution(computedMonthlyContribution)
        setMortgageRequired(computedMortgageRequired)
        setEquityContribution(new_computedEquityContribution)
    }

    const fetchHomeVestRange = async () => {
        fetchHomeVestRangeApi({}).then(async (res) => {
            setIsLoading(false)
            if (res?.data?.success) {
                setOfferOptions(res.data.data)
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err)
        })
    }
    const fetchHomeVestTenor = async () => {
        fetchHomeVestTenorApi({}).then(async (res) => {
            setIsLoading(false)
            if (res?.data?.success) {
                setTenorOptions(res.data.data)
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err)
        })
    }

    if (isLoading) {
        return <Loader />
    }


    return (<>
        <ScrollView px={5}>
            <Box marginY={3}>
                <FormControl>
                    <Stack>
                        <FormControl.Label>Custom Equity (Optional)</FormControl.Label>
                        <Select color={'#ffffff'} fontSize={16} p={3} defaultValue="10" onValueChange={(item) => {
                            setMinimumEquityContribution(Number(item))
                        }}>
                            <Select.Item label="10%" value="10" />
                            <Select.Item label="15%" value="15" />
                            <Select.Item label="20%" value="20" />
                            <Select.Item label="25%" value="25" />
                            <Select.Item label="30%" value="30" />
                            <Select.Item label="35%" value="35" />
                            <Select.Item label="40%" value="40" />
                            <Select.Item label="50%" value="50" />
                        </Select>
                        <FormControl.HelperText _text={{ color: '#ffffff' }}>*Select an option from the dropdown</FormControl.HelperText>
                    </Stack>
                </FormControl>
                <FormControl marginY={3}>
                    <Stack>
                        <FormControl.Label>Upfront Payment</FormControl.Label>
                        <CurrencyInput delimiter=","
                            separator="."
                            prefix={' NGN '}
                            precision={2}
                            borderWidth={1}
                            borderColor={Theme.Colors.backgroundColorLight}
                            borderRadius={5}
                            fontSize={18}
                            style={{ padding: 5 }}
                            px={5}
                            color={'#ffffff'}
                            inputMode='decimal'
                            minValue={0} value={upfrontPayment} onChangeValue={(v) => setUpfrontPayment(v)}
                        />
                        <FormControl.HelperText _text={{ color: '#ffffff' }}>* If you would like to make some upfront payment, please specify.</FormControl.HelperText>
                    </Stack>
                </FormControl>
            </Box>
            <Flex direction='row' justify={'flex-end'}>
                {!isOpen && <Button onPress={() => onOpen()} colorScheme={'amber'} _text={{ fontWeight: 'bold' }} size={'md'} variant={'ghost'}>Open Options</Button>}
            </Flex>
            {selectedOfferOption >= 0 && <Box style={{ backgroundColor: Theme.Colors.backgroundColorAlt3, borderRadius: 5, padding: 5 }}>
                <VStack space={3}>
                    <Box>
                        <Flex my={2} mx={5} direction='row' justify='space-between'>
                            <Text color={'#ffffff'}>{minimumEquityContribution}% minimum Equity</Text>
                            <Currency color={'#ffffff'} value={equityContribution} />
                        </Flex>
                    </Box>
                    <Divider />
                    <Box>
                        <Flex my={2} mx={5} direction='row' justify='space-between'>
                            <Text color={'#ffffff'}>Mortgage Required</Text>
                            <Currency color={'#ffffff'} value={mortageRequired} />
                        </Flex>
                    </Box>
                </VStack>
            </Box>}
            {tenorOptions && tenorOptions.length > 0 && monthlyContribution > 0 && <Box marginY={3} >
                <FormControl>
                    <Stack>
                        <FormControl.Label>Select Tenor</FormControl.Label>
                        <Box overflowX={'scroll'} style={{ backgroundColor: Theme.Colors.backgroundColorAlt3, borderRadius: 5, padding: 2 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <Flex my={2} direction='row' justify='space-between'>
                                    {tenorOptions.map((tenor, indx) => {
                                        return (<TouchableOpacity key={tenor.length} onPress={() => {
                                            setSelectedTenorIndex(indx)
                                        }}><Box minW={150} mx={1} flex={1} style={{ padding: 10, backgroundColor: indx === selectedTenorIndex ? Theme.Colors.backgroundColor : null, borderColor: Theme.Colors.backgroundColor, borderWidth: 1, borderRadius: 5 }}>
                                                <Box _text={{ color: '#ffffff' }}>
                                                    <Text color={'#ffffff'}>{tenor.length}</Text>
                                                    <Text color={'#ffffff'} textTransform={'capitalize'}>{tenor.periodType}</Text>
                                                </Box>
                                                <Box>
                                                    <Currency color={'#ffffff'} value={monthlyContribution / tenor.length} />
                                                    <Text color={'#ffffff'} textTransform={'capitalize'}>/ {tenor.periodType}</Text>
                                                </Box>
                                            </Box></TouchableOpacity>)
                                    })}
                                </Flex>
                            </ScrollView>
                        </Box>
                    </Stack>
                </FormControl>
            </Box>}
            <Box marginY={2}>
                <FormControl>
                    <Stack>
                        <FormControl.Label>What is your net monthly earnings?</FormControl.Label>
                        <CurrencyInput delimiter=","
                            separator="."
                            prefix={' NGN '}
                            precision={2}
                            borderWidth={1}
                            borderColor={Theme.Colors.backgroundColorLight}
                            borderRadius={5}
                            fontSize={18}
                            style={{ padding: 5 }}
                            px={5}
                            color={'#ffffff'}
                            inputMode='decimal'
                            minValue={0} value={monthlyNewIncome} onChangeValue={setMonthlyNetIncome}
                        />
                    </Stack>
                </FormControl>
            </Box>
            <Box marginY={2}>
                <FormControl>
                    <Stack>
                        <FormControl.Label>Do you have an RSA account?</FormControl.Label>
                        <Box style={{ backgroundColor: Theme.Colors.backgroundColorAlt3, borderRadius: 5, padding: 10 }}>
                            <Radio.Group value={hasRSAIncome} name="offers" accessibilityLabel="rsa_check" onChange={(v) => {
                                setHasRSAIncome(Boolean(v))
                            }}>
                                <Flex direction='row' justify='space-between' mx={5}>
                                    <Box flex={1}>
                                        <Radio flex={1} colorScheme="warning" value={true} icon={<Icon as={<MaterialCommunityIcons name="check-bold" />} />} my={1}>
                                            <Text color={'#ffffff'}>Yes, I have</Text>
                                        </Radio>
                                    </Box>
                                    <Box flex={1}>
                                        <Radio flex={1} colorScheme="warning" value={false} icon={<Icon as={<MaterialCommunityIcons name="check-bold" />} />} my={1}>
                                            <Text color={'#ffffff'}>No, I don't</Text>
                                        </Radio>
                                    </Box>
                                </Flex>
                            </Radio.Group>
                        </Box>
                    </Stack>
                </FormControl>
            </Box>
            <Box marginY={2}>
                <FormControl>
                    <Stack>
                        <FormControl.Label>Do you have any other upfront earning?</FormControl.Label>
                        <Box style={{ backgroundColor: Theme.Colors.backgroundColorAlt3, borderRadius: 5, padding: 10 }}>
                            <Radio.Group value={hasOtherIncome} name="offers" accessibilityLabel="earn_check" onChange={(v) => {
                                setOtherIncome(Boolean(v))
                            }}>
                                <Flex direction='row' justify='space-between' mx={5}>
                                    <Box flex={1}>
                                        <Radio flex={1} colorScheme="warning" value={true} icon={<Icon as={<MaterialCommunityIcons name="check-bold" />} />} my={1}>
                                            <Text color={'#ffffff'}>Yes, I do</Text>
                                        </Radio>
                                    </Box>
                                    <Box flex={1}>
                                        <Radio flex={1} colorScheme="warning" value={false} icon={<Icon as={<MaterialCommunityIcons name="check-bold" />} />} my={1}>
                                            <Text color={'#ffffff'}>No, I don't</Text>
                                        </Radio>
                                    </Box>
                                </Flex>
                            </Radio.Group>
                        </Box>
                    </Stack>
                </FormControl>
            </Box>
            {false && <Box marginY={2} style={{ backgroundColor: Theme.Colors.backgroundColorAlt2, borderRadius: 5, padding: 10 }}>
                <Flex direction='row' justify='space-between' mx={5}>
                    <Box pt={5}>
                        <HStack space={2}>
                            <Icon as={<MaterialCommunityIcons name="information-outline" />} />
                            <Text color={'#ffffff'}>Set up direct debit</Text>
                        </HStack>
                    </Box>
                    <Box>
                        <Switch onTrackColor="orange.200" onThumbColor="orange.500" size="lg" />
                    </Box>
                </Flex>
            </Box>}
            <Box marginY={10}>
                <Button isDisabled={mortageRequired <= 0} isLoading={isLoading} isLoadingText='Processing' variant={'solid'} style={Shared.Button.primary} onPress={() => {
                    onLocationOptionOpen()
                }}>
                    Next
                </Button>
            </Box>
        </ScrollView>
        <Actionsheet isOpen={isOpen} onClose={onClose} disableOverlay>
            <Actionsheet.Content style={{ backgroundColor: Theme.Colors.backgroundColorAlt3 }} >
                <Box mb={7} w="100%" h={70} px={4} justifyContent="center">
                    <Box><Text textAlign={'center'} fontSize={'2xl'} fontWeight={'extrabold'} color={'#ffffff'}>
                        Property Price Range
                    </Text></Box>
                    <Box mt={3}>
                        <Text textAlign={'center'} fontSize="16" color="gray.500" _dark={{
                            color: "gray.300"
                        }}>
                            *Price range depends on available construction projects
                        </Text>
                    </Box>
                </Box>
                <Box mx={2}>
                    <Radio.Group value={selectedOfferOption} name="offers" accessibilityLabel="pick a choice" onChange={(idx) => {
                        setSelectedOfferOption(idx)
                    }}>
                        {offerOptions && offerOptions.map((option, indx) => (
                            <Actionsheet.Item key={option.identifier} style={styles.dark_radio} >
                                <Radio size={'md'} style={{ borderColor: '#ececec' }} colorScheme="warning" value={indx} icon={<Icon as={<MaterialCommunityIcons name="circle" />} />} my={1}>
                                    <Box >
                                        <Text color={'#ffffff'} textBreakStrategy='balanced'>{option.description}</Text>
                                    </Box>
                                </Radio>
                            </Actionsheet.Item>
                        ))}
                    </Radio.Group>
                </Box>
                <Box mt={10}>
                    <Button disabled={selectedOfferOption < 0} h={50} w={'400'} variant={'solid'} style={Shared.Button.primary} onPress={onClose}>
                        Continue
                    </Button>
                </Box>

            </Actionsheet.Content>
        </Actionsheet>
        <Actionsheet isOpen={isLocationOptionOpen} onClose={onLocationOptionClose} >
            <Actionsheet.Content style={{ backgroundColor: '#f9f9f9' }} >
                <Box w="100%" px={4} justifyContent="center">
                    <Box>
                        <Text textAlign={'center'} fontSize={'2xl'} fontWeight={'extrabold'} color={'#000000'}>
                            Select Preferred Location
                        </Text>
                    </Box>
                    <Box mt={3}>
                        <Text textAlign={'center'} fontSize="16" color="gray.500" _dark={{
                            color: "gray.300"
                        }}>
                            Property price range for {offerOptions[selectedOfferOption]?.description}
                        </Text>
                    </Box>
                </Box>
                {locationOptions && locationOptions.length > 0 && <ScrollView mt={7} w={'100%'} h={'full'}>

                    <Radio.Group space={3} flexDirection={'row'} flexWrap={'wrap'} value={selectedLocation} name="locations" accessibilityLabel="pick a location" onChange={(v) => {
                        setSelectedLocation(v)
                    }}>
                        {locationOptions.map(location => {
                            return (
                                <Radio key={location.id} style={{ borderColor: '#ececec', borderWidth: 1, backgroundColor: '#e9e8e8', borderRadius: 7, margin: 5, padding: 2 }} size={'md'} colorScheme={'warning'} value={location.id} icon={<Icon as={<MaterialCommunityIcons name="circle" />} />} my={1}>
                                    <Box px={2} >
                                        <Text>{location.name}</Text>
                                    </Box>
                                </Radio>)
                        })}
                    </Radio.Group>
                </ScrollView>}
                <Box mt={10}>
                    <Button isLoading={isSubmitting} isLoadingText='Processing Request' disabled={!selectedLocation || isSubmitting} h={50} w={'400'} variant={'solid'} style={Shared.Button.primary} onPress={() => {
                        onLocationOptionClose()
                        setConfirmOpen(true)
                    }}>
                        Continue
                    </Button>
                </Box>
            </Actionsheet.Content>
        </Actionsheet>
        <AlertDialog leastDestructiveRef={cancelConfirmRef} isOpen={isConfirmOpen} onClose={onConfirmClose}>
            <AlertDialog.Content>
                <AlertDialog.CloseButton />
                <AlertDialog.Header>Summary</AlertDialog.Header>
                <AlertDialog.Body>
                    <Box bgColor={'amber.100'} p={3} mb={5}>
                        This a summary of your HomeVest plan. By clicking "Proceed" you accept the 
                        <Link isUnderlined={true} href='https://www.imperialmortgagebank.com/HomeVest%20Ts%20&%20Cs.pdf'>terms and conditions</Link> 
                        and agree that an HomeVest account should be created for you.
                    </Box>
                    <Box mb={1}>
                        <Text>Mortgage Amount</Text>
                        <Currency fontWeight={'bold'} value={mortageRequired} />
                    </Box>
                    <Box mb={1}>
                        <Text>Equity Contribution</Text>
                        <Currency fontWeight={'bold'} value={equityContribution} />
                    </Box>
                    {tenorOptions[selectedTenorIndex]?.length > 0 && <Box mb={1}>
                        <Text>Monthly Contribution</Text>
                        <Currency fontWeight={'bold'} value={monthlyContribution / tenorOptions[selectedTenorIndex].length} />
                    </Box>}
                    {tenorOptions[selectedTenorIndex]?.length > 0  && <Box mb={1}>
                        <Text>Contribution Tenor</Text>
                        <Text fontWeight={'bold'}>{tenorOptions[selectedTenorIndex].length} Months</Text>
                    </Box>}
                    <Box mb={1}>
                        <Text>Contribution Percentage</Text>
                        <Text fontWeight={'bold'}>{minimumEquityContribution}%</Text>
                    </Box>

                </AlertDialog.Body>
                <AlertDialog.Footer>
                    <Button.Group space={2}>
                        <Button variant="unstyled" colorScheme="coolGray" onPress={onConfirmClose} ref={cancelConfirmRef}>
                            Cancel
                        </Button>
                        <Button variant={'solid'} style={Shared.Button.primary} onPress={() => {
                            onConfirmClose()
                            createHomevestPlan()
                        }}>
                        Proceed
                        </Button>
                    </Button.Group>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog>
    </>)
}

export default CreateHomeVestScreen