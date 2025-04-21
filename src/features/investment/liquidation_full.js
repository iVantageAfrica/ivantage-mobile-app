import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View, KeyboardAvoidingView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, HStack, Button, Heading, Input, Text, Select, FormControl, WarningOutlineIcon } from "native-base";
import { useValidation } from 'react-native-form-validator';
import { useAuthentication } from "../../queries/useAuthentication";
import { getAppConfig } from '../../common/device';
import Config from '../../common/config'

import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'


const FullLiquidationScreen = ({ navigation, route }) => {
    const { fetchParamData: liquidateDeal } = useAuthentication('liquidate', 'post', navigation);
    const { fetchData: getAccounts } = useAuthentication('getbankaccounts', 'get', navigation);
    const [selectedInvestment, setSelectedInvestment] = useState(route.params.selectedInvestment)
    const [additionalInformation, setAdditionalInformation] = useState('')
    const displayName = getAppConfig().client_host_wallet_name

    const [account, setAccount] = useState(null)
    const [myaccounts, setMyAccounts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const { validate, isFieldInError, getErrorsInField } =
        useValidation({
            state: { account },
        });

    useEffect(() => {
        const valid = validate({
            account: {numbers:true, required: true }
        })
        setIsValid(valid);
        getBankAccounts()
    }, [account])

    const getBankAccounts = () => {
        getAccounts({}).then(res => {
            if(res && res.data && res.data.success) {
                setMyAccounts(res.data.data)
            }
        })
    }

    const liquidateInvestment = async() => {
        setIsLoading(true)
        await liquidateDeal({
            partialLiquidation: false,
        accountNumber: account,
        amount: 0,
        urlParams: {investment_id: selectedInvestment.item.objectId},
        additionalInformation: additionalInformation.trim().length > 0 ? additionalInformation : 'Not Provided'
       }).then(res => {
        setIsLoading(false)
            if(res && res.data && res.data.success) {
                AlertBox.showSuccess('Your request has been received successfully.')
                navigation.navigate('investment_home')
                return 
            }
            AlertBox.showErrorEx(res)
            return null
        }).catch(e => {
            setIsLoading(false)
            AlertBox.showErrorEx(e)
            return null
        })
        
    }

    const getDropItemLabel = (account) => {
        const lbl = Config().getLabel(account.account_type)
        return `${lbl} Account - ${account.account_info.AccountName}(${account.account_info.AccountNo})`
    }

    if(isLoading) {
        return <Loader />
    }

    return (
        <KeyboardAvoidingView behavior='padding'  style={styles.container}>
        <ScrollView >
        <VStack >
            <Box px={7}>
                <Box mb={5}>
                    <Heading mt={5} size="2xl" fontWeight="800" color="#ffffff" >
                        Full Liquidation
                 </Heading>
                </Box>
                <VStack >
                    <FormControl mb={3} isRequired>
                        <FormControl.Label type={'Number'} _text={{
                            color: "#ffffff",
                            fontWeight: "medium",
                            fontSize: "sm"
                        }}>Account to credit</FormControl.Label>
                        <Select w={'full'} onValueChange={(v) => {
                            setAccount(v)
                        }} value={account} placeholder={'Select Account'} bgColor={'#ffffff'} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                            {myaccounts && myaccounts.map(y => <Select.Item key={y.objectId} isDisabled={y.account_info.AccountStatus == 'PENDING'} label={getDropItemLabel(y)} value={y.account_info.AccountNo} />)}
                        </Select>
                        {isFieldInError('account') && <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                            Account not selected
                            </FormControl.ErrorMessage>}
                            
                    </FormControl>
                    
                    <FormControl >
                        <FormControl.Label type={'Email'} _text={{
                            color: "#ffffff",
                            fontWeight: "medium",
                            fontSize: "sm"
                        }}>Description</FormControl.Label>
                        <Input w={'full'} onChangeText={(v) => {
                            setAdditionalInformation(v)
                        }} value={additionalInformation} borderRadius={20} multiline={true} h={100} placeholder={'Description'} bgColor={'#ffffff'} style={{ ...Shared.Select.default }}  />
                        
                    </FormControl>
                </VStack>
                <VStack mt={10}>
                <Box px={1} marginBottom={5} alignItems={'center'} justifyContent={'center'} space={5}>
                <Button isDisabled={!isValid} variant={'solid'} w={'full'} size={'lg'} style={Shared.Button.primary} onPress={() =>{
                            liquidateInvestment()
                        }}>Liquidate</Button>
                </Box>
                </VStack>
            </Box>
           
        </VStack>
        </ScrollView></KeyboardAvoidingView>
    );
};


export default FullLiquidationScreen;