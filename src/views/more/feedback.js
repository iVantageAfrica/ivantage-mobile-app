import { Box, Button, FormControl, Heading, Input, ScrollView, VStack, Select } from "native-base";
import React, {useState} from "react";

import { useAuthentication } from "../../queries/useAuthentication";
import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'

const FeedbackScreen = ({navigation, route}) => {
    const { fetchParamData: requestForm } = useAuthentication('request_form', 'post', navigation);
    const [isLoading, setLoading] = useState(false)
    const { authData, setAuthData } = useUser();
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const subjectOptions = [
        'Bills Payment',
        'USSD Transactions',
        'Mobile Banking Transactions',
        'Card Related Issue',
        'ATM Dispense Error',
        'Airtime Dispense Error',
        'ATM Bills Payment',
        'POS Dispense Error',
        'Web Dispense Error',
        'General Issues',
        'Enquiries'
    ]

    const submitEnquiries = () => {
        if(!subject || !message || subject.trim().length == 0 || message.trim().length == 0) {
            return
        }
        setLoading(true)
        requestForm({
            RequestType: 'Enquiries & Complaints',
            FirstName:authData.user.firstname,
            LastName:authData.user.surname,
            Email:authData.user.email,
            Phone:authData.user.phone,
            CustomerCode:authData.user.customer_code,
            subject: `Enquiry / Complaint - ${subject}`,
            EnquirySubject: `Enquiry / Complaint - ${subject}`,
            EnquiryMessage: message,
            urlParams: {message_type: 'generic'}
        }).then(res => {
            setLoading(false)
            if (res && res.data && res.data.success) {
                resetForm()
                AlertBox.showSuccess('Submitted successfully.')
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setLoading(false)
            AlertBox.showErrorEx(err);
        })
    }

    const resetForm = () => {
        setMessage('')
        setSubject('')
        navigation.goBack()
    }

    return <>
        <ScrollView >
            <VStack space={5} px={5}>
                <FormControl>
                    <FormControl.Label _text={{color: '#ffffff'}}>
                        Subject
                    </FormControl.Label>
                    <Select onValueChange={(v) => {
                        setSubject(v)
                    }} bgColor={'#ffffff'} borderRadius={10} variant={'rounded'}>
                        {subjectOptions.map((option, indx) => <Select.Item key={indx} value={option} label={option}>{option}</Select.Item>)}
                    </Select>
                </FormControl>
                <FormControl>
                    <FormControl.Label _text={{color: '#ffffff'}}>
                        Message
                    </FormControl.Label>
                    <Input onChangeText={(t) => {
                        setMessage(t)
                    }} bgColor={'#ffffff'} borderRadius={10} multiline={true} numberOfLines={9} />
                </FormControl>
            </VStack>
        </ScrollView>
        <Box px={5} mb={20} mt={30}>
            <Button isLoading={isLoading} isLoadingText={'Submitting...'} onPress={submitEnquiries} colorScheme={'orange'}>Submit</Button>
        </Box>
    </>
}

/**
 * Bills Payment
USSD Transactions
Mobile Banking Transactions
Card Related Issue
ATM Dispense Error
ATM Bills Payment/Airtime Dispense Error
POS Dispense Error
Web Dispense Error
General Issues
Enquiries
 */

export default FeedbackScreen