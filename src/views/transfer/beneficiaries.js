import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { getAppConfig, isAndroid } from '../../common/device';

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, FormControl, Select, Input, Image, Text, Link, Fab, FlatList, WarningOutlineIcon, ScrollView } from "native-base";
import BottomSheet, { useBottomSheetTimingConfigs, BottomSheetView } from '@gorhom/bottom-sheet';
import MoreItem from '../../components/moreitem'
import ListItem from '../../components/listitem'
import { useAuthentication } from "../../queries/useAuthentication";
import { useValidation } from 'react-native-form-validator';
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import Constants from 'expo-constants';
import { Easing } from 'react-native-reanimated';
const { AccountManager, IvantageLogo, Bank } = Theme.SVG

import { useUser } from '../../context/usercontext'

const BeneficiaryScreen = ({ navigation, route }) => {
    const { fetchData: getBeneficiaries } = useAuthentication('getbeneficiaries', 'get', navigation);
    const { fetchData: nameEnquiry } = useAuthentication('name_enquiry', 'get', navigation);
    const { fetchData: addNewBeneficiary } = useAuthentication('addbeneficiaries', 'post', navigation);
    const { fetchParamData: deleteBeneficiary } = useAuthentication('deletebeneficiary', 'delete', navigation);
    const { fetchData: getBanks } = useAuthentication('banklist', 'get', navigation);
    const { authData, setAuthData } = useUser();
    const [beneficiaries, setBeneficiaries] = useState([])
    const [mainbeneficiaries, setMainBeneficiaries] = useState([])
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
    const [openState, setOpenState] = useState(0)
    const [isLoading, setLoading] = useState(true)
    const [isNameLoading, setNameLoading] = useState(false)
    const [isEditing, setEditing] = useState(false)

    const [beneficiaryBankLabel, setBeneficiaryBankLabel] = useState(null)
    const [beneficiaryBank, setBeneficiaryBank] = useState(null)
    const [beneficiaryName, setBeneficiaryName] = useState('')
    const [beneficiaryAccountNo, setBeneficiaryAccountNo] = useState('')
    const [beneficiaryAccountName, setBeneficiaryAccountName] = useState('')
    const [beneficiaryLookupSessionID, setBeneficiaryLookUpSessionID] = useState('')
    const [beneficiaryLookupMetaData, setBeneficiaryLookUpMetaData] = useState(null)

    const [beneficiaryFilter, setBeneficiaryFilter] = useState('')
    const [bankFilter, setBankFilter] = useState('')

    const [isValid, setIsValid] = useState(false)
    const isFocused = useIsFocused();
    const { validate, isFieldInError, getErrorsInField } =
        useValidation({
            state: { beneficiaryBank, beneficiaryName, beneficiaryAccountNo, beneficiaryAccountName },
        });



    const [banks, setBanks] = useState([])
    const [rawBanks, setRawBanks] = useState([])
    const displayName = getAppConfig().client_display_name

    const animationConfigs = useBottomSheetTimingConfigs({
        duration: 250,
        easing: Easing.linear,
    });
    // ref
    const bottomSheetRef = useRef();
    const optionbottomSheetRef = useRef();
    const bankRef = useRef(null)

    // variables
    const snapPoints = useMemo(() => [20, '100%'], []);

    const optionsnapPoints = useMemo(() => [1, '40%'], []);

    // callbacks
    const handleSheetChanges = useCallback((index) => {

    }, []);

    useEffect(() => {
        getBeneficiaryList()
        getBankList()
    }, [openState])

    const getBeneficiaryList = () => {
        setLoading(true)
        getBeneficiaries({}).then(res => {
            setLoading(false)
            if (res && res.data && res.data.success) {
                setBeneficiaries(res.data.data)
                setMainBeneficiaries(res.data.data)
                return
            }
            AlertBox.showErrorEx(res)
        })
    }

    const removeBeneficiary = () => {
        if(!selectedBeneficiary) { return}
        AlertBox.confirmBox(`You are about to remove ${selectedBeneficiary.accountName} (${selectedBeneficiary.name}) from your list of beneficiaries. Do you wish to continue?`, () => {
            setLoading(true)
            deleteBeneficiary({
                urlParams:{beneficiary_id: selectedBeneficiary.objectId}
            }).then(res => {
                setLoading(false)
                if (res && res.data && res.data.success) {
                    AlertBox.showSuccess('Beneficiary deleted successfully.')
                    setSelectedBeneficiary(null)
                    if(optionbottomSheetRef.current) {
                        optionbottomSheetRef.current.close()
                    }
                    getBeneficiaryList()
                    return
                }
                AlertBox.showErrorEx(res)
            })
        }, () => {})
        
    }

    const filterBeneficiaries = (str) => {
        if(!str || str.trim().length == 0) {
            setBeneficiaries(mainbeneficiaries)
            return
        }
        str = str.toLowerCase()
        const filtered = mainbeneficiaries.filter(t => {
            return t.accountName.toLowerCase().indexOf(str) > -1
        })
        setBeneficiaries(filtered)
    }

    const filterBanks = (str) => {
        if (!str || str.trim().length == 0) {
            setBanks(rawBanks)
            return
        }
        str = str.trim().toLowerCase()
        const filtered = rawBanks.filter(t => {
            return t.bankName.toLowerCase().indexOf(str) > -1
        })
        setBanks(filtered)
    }

    const nameEnquiryReq = (data) => {
        if(!beneficiaryBank || !beneficiaryBank.bankCode) {
            AlertBox.showError("Select beneficiary's bank from the list to continue.")
            return
        }
        setNameLoading(true)
        nameEnquiry({
            params: { accountNo: data, bankCode: beneficiaryBank.bankCode }
        }).then(res => {
            setNameLoading(false)
            if (res && res.data && res.data.success) {
                setBeneficiaryAccountName(res.data.data.accountName)
                setBeneficiaryAccountNo(res.data.data.accountNumber)
                setBeneficiaryLookUpMetaData(res.data.data)
                setBeneficiaryLookUpSessionID(res.data.data.SessionID)
                return
            }
            setBeneficiaryAccountName('')
            AlertBox.showErrorEx(res)
        })
    }

    const addNewBeneficiaryReq = () => {
        setLoading(true)
        addNewBeneficiary({
            name: beneficiaryName,
            bankName: beneficiaryBank.bankName,
            bankCode: beneficiaryBank.bankCode,
            accountName: beneficiaryAccountName,
            accountNumber: beneficiaryAccountNo,
            lookup_session_id: beneficiaryLookupSessionID,
            lookup_metadata: beneficiaryLookupMetaData
        }).then(res => {
            setLoading(false)
            if (res && res.data && res.data.success) {
                if(selectedBeneficiary) {
                    AlertBox.showSuccess('Beneficiary updated successfully.')
                    setSelectedBeneficiary(null)
                    setEditing(false)
                    if(optionbottomSheetRef.current) {
                        optionbottomSheetRef.current.close()
                    }
                    setOpenState(0)
                    getBeneficiaryList()
                    return
                }else {
                    AlertBox.showSuccess('New Beneficiary add successfully.')
                }
                
                setOpenState(0)
                return
            }
            AlertBox.showErrorEx(res)
        })
    }

    const getBankList = () => {
        getBanks({}).then(res => {
            if (res && res.data && res.data.success) {
                setBanks(res.data.data)
                setRawBanks(res.data.data)
                return
            }
            setBanks([])
            setRawBanks([])
        })
    }

    const prepareForEdit = () => {
        if(!selectedBeneficiary) { return }
        setBeneficiaryAccountNo(selectedBeneficiary.accountNumber)
        setBeneficiaryBankLabel(selectedBeneficiary.beneficiaryBankLabel)
        setBeneficiaryBank({code: selectedBeneficiary.bankCode, label: selectedBeneficiary.bankName})
        setBeneficiaryAccountName(selectedBeneficiary.accountName)
        setBeneficiaryName(selectedBeneficiary.name)
        setEditing(true)
        setOpenState(1)
    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <>
        <ScrollView style={{...styles.container}}>
            <Box>
                <VStack h={'100%'} mb={200} >
                    <Box mb={5} px={3}>
                    <Input style={Shared.TextInput.default} placeholder={'Filter Beneficiary List'} onChangeText={(t) => {
                                setBeneficiaryFilter(t)
                                filterBeneficiaries(t)
                        }} variant={'rounded'} value={beneficiaryFilter} />
                    </Box>
                    {beneficiaries && beneficiaries.length > 0 && beneficiaries.map((item, index) => <MoreItem isSelected={selectedBeneficiary && item.objectId == selectedBeneficiary.objectId} key={index} onPress={() => {
                        //navigation.navigate('savings_tranfers_to_own_acct')
                        if(selectedBeneficiary) {
                            setSelectedBeneficiary(null)
                            optionbottomSheetRef.current.close()
                            return
                        }
                        optionbottomSheetRef.current.expand()
                        setSelectedBeneficiary(item)
                    }} imgIcon={<IvantageLogo marginTop={5} marginLeft={20} width={30} height={40} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={`${item.accountName} (${item.name})`} subtitle={`${item.accountNumber} - ${item.bankName}`} />)}
                </VStack>
            </Box>
            <Box position="relative" h={100} w="100%">
                <Fab renderInPortal={(isFocused || isEditing)} onPress={() => {
                    const isOpen = openState == 1 ? 0 : 1
                    if(!isOpen) {
                        setEditing(false)
                    }
                    setOpenState(isOpen)
                }} style={Shared.Button.primary} mb={'90px'} size="sm" icon={<Icon color="white" as={<FontAwesome name={openState == 0 && !isEditing ? 'plus' : 'chevron-down'} />} size="sm" />} />
            </Box>
            </ScrollView>
            <BottomSheet
                enableContentPanningGesture={true}
                backgroundStyle={{ backgroundColor: Theme.Colors.backgroundColor }}
                ref={optionbottomSheetRef}
                enablePanDownToClose={true}
                // index={selectedBeneficiary ? 1 : 0}
                snapPoints={optionsnapPoints}
                animationConfigs={animationConfigs}
            >
                <BottomSheetView p={5} style={styles.container}>
                    <Box ml={3} mb={5}>
                        <Heading mt={1} fontWeight="600" color="#ffffff" >
                            Beneficiary Options
                        </Heading>
                    </Box>
                    <VStack>
                        <ListItem onPress={prepareForEdit} imgIcon={<Icon mt={3} ml={3} size={5} color={'#ffffff'} as={FontAwesome} name="edit" />} title={'Edit Beneficiary'} />
                        <ListItem onPress={removeBeneficiary} imgIcon={<Icon mt={3} ml={3} size={5} color={'#ffffff'} as={FontAwesome} name="close" />} title={'Delete Beneficiary'} />
                    </VStack>
                </BottomSheetView>

            </BottomSheet>
            <BottomSheet
                backgroundStyle={{ backgroundColor: Theme.Colors.backgroundColor }}
                ref={bottomSheetRef}
                index={openState}
                enablePanDownToClose={true}
                snapPoints={snapPoints}
                animationConfigs={animationConfigs}
                onChange={handleSheetChanges}
            >
                <VStack p={5} style={styles.container}>
                    <Box ml={3} mb={5}>
                        <Heading mt={1} fontWeight="600" color="#ffffff" >
                            {selectedBeneficiary ? 'Edit Beneficiary' : 'Add Beneficiary'}
                        </Heading>
                    </Box>
                    <ScrollView>
                        <FormControl mb={2} isRequired>
                            <FormControl.Label _text={{
                                color: "#ffffff",
                                fontWeight: "medium",
                                fontSize: "sm"
                            }}>Beneficiary Bank</FormControl.Label>
                            <Select 
                            
                            _actionSheetContent={{ bottom: 0 }}
                            _actionSheetBody={{
                                ListHeaderComponent: (isAndroid ?<FormControl >
                                    <FormControl.Label _text={{
                                        color: "#000000",
                                        fontWeight: "medium",
                                        fontSize: "sm"
                                    }}>Search</FormControl.Label>
                                    <Input
                                    ref={bankRef}
                                        onChangeText={(t) => {
                                            setBankFilter(t)
                                            filterBanks(t) 
                                            if(bankRef && bankRef.current && isAndroid) {
                                                bankRef.current.focus()
                                            }
                                           
                                        }}
                                        autoFocus={isAndroid}
                                        value={bankFilter} variant={'rounded'} placeholder='Search Banks' />
                                </FormControl> : null)
                            }}
                            w={'full'} onValueChange={(v) => {
                                const selectedBank = banks.filter(item => item.bankCode === v)[0]
                                setBeneficiaryBank(selectedBank)
                                setBeneficiaryBankLabel(selectedBank.bankName)
                            }} value={beneficiaryBankLabel} placeholder={'Select Bank'} bgColor={'#ffffff'} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                {banks && banks.map((y, index) => <Select.Item key={index} label={y.bankName} value={y.bankCode} />)}
                            </Select>
                            {isFieldInError('account') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                Bank Name not selected
                            </FormControl.ErrorMessage>}
                        </FormControl>
                        <HStack>
                            <Box w={'4/5'}>
                                <FormControl mb={2} isRequired>
                                    <FormControl.Label _text={{
                                        color: "#ffffff",
                                        fontWeight: "medium",
                                        fontSize: "sm"
                                    }}>Beneficiary Account Number</FormControl.Label>
                                    <Input onSubmitEditing={(e) => {
                                        nameEnquiryReq(beneficiaryAccountNo)
                                    }} maxLength={11} style={Shared.TextInput.default} placeholder={'Enter Account Number'} onChangeText={(t) => {
                                        if(t.trim().length == 0) {
                                            setBeneficiaryAccountName('')
                                        }
                                        setBeneficiaryAccountNo(t)
                                    }} variant={'rounded'} value={beneficiaryAccountNo} keyboardType={'number-pad'} />
                                    {isFieldInError('account') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                        Account Number not correctly filled.
                                    </FormControl.ErrorMessage>}
                                </FormControl>
                            </Box>
                            <Box ml={2} pt={8}>
                                <Button isLoading={isNameLoading} isDisabled={!beneficiaryAccountNo || beneficiaryAccountNo.length == 0} onPress={() => nameEnquiryReq(beneficiaryAccountNo)} style={Shared.Button.primary} variant={'solid'}>Check</Button>
                            </Box>
                        </HStack>
                        {true && <VStack mt={2}>
                            <FormControl mb={2} >
                                <FormControl.Label _text={{
                                    color: "#ffffff",
                                    fontWeight: "medium",
                                    fontSize: "sm"
                                }}>Beneficiary Account Name</FormControl.Label>
                                <Input style={Shared.TextInput.default} placeholder={'Beneficiary Account Name'} onChangeText={(t) => {
                                    
                                }} variant={'rounded'} value={beneficiaryAccountName} isReadOnly={true} />
                                {isFieldInError('account') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    Account Number not correctly filled.
                            </FormControl.ErrorMessage>}
                            </FormControl>
                            <FormControl >
                                <FormControl.Label _text={{
                                    color: "#ffffff",
                                    fontWeight: "medium",
                                    fontSize: "sm"
                                }}>Beneficiary's Alias</FormControl.Label>
                                <Input style={Shared.TextInput.default} placeholder={'Beneficiary\'s Alias'} onChangeText={(t) => {
                                    setBeneficiaryName(t)
                                }} variant={'rounded'} value={beneficiaryName} maxLength={100} />
                            </FormControl>
                        </VStack>}
                    </ScrollView>
                    <View style={{ position: 'relative', left: 0, right: 0, marginTop: 30 }}>
                        <Box>
                            <HStack marginBottom={5} alignItems={'center'} justifyContent={'center'} space={5}>
                                <Box w={'full'}><Button variant={'solid'} w={'full'} isDisabled={!beneficiaryAccountName || beneficiaryAccountName.length == 0 || beneficiaryAccountNo.length == 0 || !beneficiaryBank} size={'lg'} style={Shared.Button.primary} onPress={() => {
                                    addNewBeneficiaryReq()
                                }}>
                                    {selectedBeneficiary ? 'Update Beneficiary' : 'Add New Beneficiary'}
                                    
                                    </Button></Box>
                            </HStack>
                        </Box>
                    </View>
                </VStack>
            </BottomSheet>
            {isLoading && openState === 0 && <Loader />}
        </>
    );
};


export default BeneficiaryScreen;