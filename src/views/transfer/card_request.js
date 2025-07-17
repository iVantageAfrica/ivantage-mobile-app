import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useFocusEffect } from '@react-navigation/native'

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox, Select, FormControl, WarningOutlineIcon } from "native-base";

import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import { useUser } from '../../context/usercontext'
import { getAppConfig } from '../../common/device';
import Config from '../../common/config'

const CardRequestScreen = ({ navigation, route }) => {
    const reasons = [
        'First time request', 'Suspected Fraud', 'Lost Card', 'Stolen Card', 'Expired Card', 'Retracted Card', 'Damaged Card'
    ]
    const displayName = getAppConfig().client_host_wallet_name

    const { fetchData: getUser } = useAuthentication('user', 'get', navigation);
    const { fetchData: getAccounts } = useAuthentication('getbankaccounts', 'get', navigation);
    const { fetchParamData: requestForm } = useAuthentication('request_form', 'post', navigation);
    const { authData, setAuthData } = useUser();
    const [myaccounts, setMyAccounts] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [account, setAccount] = useState(null)
    const [comment, setComment] = useState('')
    const [pickupbranch, setPickUpBranch] = useState('')
    const [toaccount, setToAccount] = useState(null)

    useFocusEffect(useCallback(() => {
        getUserData()
        getBankAccounts()
    }, []))

    const getUserData = () => {
        setLoading(true)
        getUser({}).then(res => {
            setLoading(false)
            if (res && res.data.success) {
                const authDataCone = { ...authData }
                authDataCone.user = res.data.data
                setAuthData(authDataCone)
                return
            }
            AlertBox.showErrorEx(res);
        }).catch(err => {
            setLoading(false)
            AlertBox.showErrorEx(err);
        })
    }

    const getDropItemLabel = (account) => {
        const lbl = Config().getLabel(account.account_type)
        return `${lbl} Account - ${account.account_info.AccountName}(${account.account_info.AccountNo})`
    }

    const submitRequestForm = () => {
        if(!toaccount || !account) {
            AlertBox.showError('Invalid form filled. Please fill the form properly.')
            return
        }
        setLoading(true)
        requestForm({
            RequestType: 'Bank Card Request',
            FirstName:authData.user.firstname,
            LastName:authData.user.surname,
            Email:authData.user.email,
            Phone:authData.user.phone,
            CustomerCode:authData.user.customer_code,
            AccountToLink: toaccount,
            AccountToCharge: account,
            Comment: comment,
            PickUpBranch: pickupbranch,
            urlParams: {message_type: 'generic'}
        }).then(res => {
            setLoading(false)
            if (res && res.data && res.data.success) {
                AlertBox.showSuccess('Card request submitted succcessfully.')
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setLoading(false)
            AlertBox.showErrorEx(err);
        })
    }

    const getBankAccounts = () => {
        getAccounts({}).then(res => {
            if (res && res.data && res.data.success) {
                setMyAccounts(res.data.data)
            }
        })
    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <VStack style={styles.container}>
            <Box px={2}>
                <Box ml={3} mb={5}>
                    <Heading mt={5} size="xl" fontWeight="800" color={Theme.Colors.tertiaryText} >
                        Card Request
                    </Heading>
                </Box>
                <VStack space={2} px={5} mt={5}>
                    <VStack space={2}>
                        <FormControl isRequired>
                            <FormControl.Label type={'Email'} _text={{
                                color: Theme.Colors.tertiaryText,
                                fontWeight: "medium",
                                fontSize: "sm"
                            }}>Account To Link Card</FormControl.Label>
                            <Select w={'full'} onValueChange={(v) => {
                                setToAccount(v)
                            }} value={toaccount} placeholder={'Select Account'} bgColor={'#ffffff'} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                {myaccounts && myaccounts.map(y => <Select.Item key={y.objectId} label={getDropItemLabel(y)} value={y.account_info.AccountNo} />)}
                            </Select>
                            {!toaccount && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                Account not selected
                            </FormControl.ErrorMessage>}
                            <Text style={{ fontSize: 11, color: Theme.Colors.tertiaryText }}>The requested card will be linked to this selected account.</Text>
                        </FormControl>
                    </VStack>
                    <VStack space={2}>
                        <FormControl isRequired>
                            <FormControl.Label type={'Email'} _text={{
                                color: Theme.Colors.tertiaryText,
                                fontWeight: "medium",
                                fontSize: "sm"
                            }}>Account To Debit</FormControl.Label>
                            <Select w={'full'} onValueChange={(v) => {
                                setAccount(v)
                            }} value={account} placeholder={'Select Account'} bgColor={Theme.Colors.backgroundColor} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                {myaccounts && myaccounts.map(y => <Select.Item key={y.objectId} label={getDropItemLabel(y)} value={y.account_info.AccountNo} />)}
                            </Select>
                            {!account && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                Account not selected
                            </FormControl.ErrorMessage>}
                            <Text style={{ fontSize: 11, color: Theme.Colors.tertiaryText }}>This selected account will be debited for this request.</Text>
                        </FormControl>
                    </VStack>
                    <VStack space={2}>
                        <Text style={{ color: Theme.Colors.tertiaryText, fontSize: 13 }}>Pickup Branch</Text>
                        <Select w={'full'} onValueChange={(v) => {
                               setPickUpBranch(v)
                            }} value={pickupbranch} placeholder={'Select Pickup Branch'} bgColor={Theme.Colors.backgroundColor} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                { ['Lagos Branch', 'Abuja Branch'].map(y => <Select.Item key={y} label={y} value={y} />)}
                            </Select>
                    </VStack>
                    <VStack space={2}>
                        <Text style={{ color: Theme.Colors.tertiaryText, fontSize: 13 }}>Reason  / Comment</Text>
                        <Select w={'full'} onValueChange={(v) => {
                               setComment(v)
                            }} value={comment} placeholder={'Select Reason'} bgColor={Theme.Colors.backgroundColor} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                                {reasons && reasons.map(y => <Select.Item key={y} label={y} value={y} />)}
                            </Select>
                    </VStack>
                    
                </VStack>
                <VStack px={3} mt={10}>
                    <Box >
                        <HStack marginBottom={5} alignItems={'center'} justifyContent={'center'} space={5}>
                            <Box w={'full'}><Button variant={'solid'} w={'full'} size={'lg'} style={Shared.Button.primary} onPress={() => {
                                submitRequestForm()
                            }}>Request Card</Button></Box>
                        </HStack>
                    </Box>
                </VStack>
            </Box>
        </VStack>

    );
};


export default CardRequestScreen;