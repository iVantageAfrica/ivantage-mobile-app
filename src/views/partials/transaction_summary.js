import React, {useEffect, useRef, useState} from 'react';
import Theme from '../../themes';
import Shared from '../../themes/shared';
import Currency from '../../components/currency'

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Center } from "native-base";
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useUser } from '../../context/usercontext'
import AlertBox from '../../components/alertbox';

const TransactionSummary = (props) => {
    const {transaction = null, is_detail = true} = props
    const { authData } = useUser();
    const [status, requestPermission] = MediaLibrary.usePermissions();
    const imageRef = useRef();


    const shareReceipt = async() => {
        if(status === null || !status.granted) {
            requestPermission()
        }
        if(status && !status.granted && !status.canAskAgain) {
            AlertBox.showError("App has no permission to access media library. Please review app's permissions in device's settings.")
            return
        }
        try {
            const fileName = (new Date()).getMinutes();
            const localUri = await captureRef(imageRef, {
              height: 440,
              quality: 1,
              fileName: `Summary_${fileName}.png`
            });
      
            await MediaLibrary.saveToLibraryAsync(localUri);
            if (localUri) {
                Sharing.isAvailableAsync().then((check) => {
                    if(check) {
                        Sharing.shareAsync(`file://${localUri}`)
                    }else {
                        AlertBox.showError("Unable to share receipt. Sharing not supported on this device.")
                    }
                })
            }
          } catch (e) {
            AlertBox.showError(`Unable to share receipt. Error: ${e.message}`)
          }
    }
    if(!is_detail) {
        return (
            <VStack >
               <Box p={3} style={{borderStyle:'dashed', borderWidth: 1, borderColor:Theme.Colors.borderColor, backgroundColor: Theme.Colors.backgroundColorAlt}}>
                    <VStack space={3}>
                        <Box>
                            <Text color={Theme.Colors.primaryText}>Recipient Account No</Text>
                            <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.accountNumber}</Text>
                        </Box>
                        <Box>
                            <Text color={Theme.Colors.primaryText}>Recipient Name</Text>
                            <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.recipientsName}</Text>
                        </Box>
                        <Box>
                            <Text color={Theme.Colors.primaryText}>Recipient Bank Name</Text>
                            <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.recipientsBankName}</Text>
                        </Box>
                        <Box>
                            <Text color={Theme.Colors.primaryText}>Amount</Text>
                            <Currency bold={'bold'} color={Theme.Colors.tertiaryText} value={transaction.amount} />
                        </Box>
                        <Box>
                            <Text color={Theme.Colors.primaryText}>Narration</Text>
                            <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transactionNarration}</Text>
                        </Box>
                        {transaction.transactionReference && <Box>
                            <Text color={Theme.Colors.primaryText}>Transaction Reference</Text>
                            <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transactionReference}</Text>
                        </Box>}
                    </VStack>
                </Box>
            </VStack>
    
        );
    }
   
    return (
        <>
        <VStack  ref={imageRef} collapsable={false}>
           <Box p={3} style={{borderStyle:'dashed', borderWidth: 1, borderColor:Theme.Colors.borderColor, backgroundColor: Theme.Colors.backgroundColorAlt}}>
                <VStack space={3}>
                    <Center>
                        <Image 
                        style={{
                            resizeMode: 'contain', height: 70
                        }}
                         alt='Logo' source={Theme.Images.appicon} />
                    </Center>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Ref. Number</Text>
                        <Text  color={Theme.Colors.tertiaryText}>{transaction.transactionType == 'D' ?  transaction.accountNumber : transaction.refAccountNo}</Text>
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Transaction ID</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transactionReference}</Text>
                    </Box>
                    {transaction.transactionReferenceNumber && <Box>
                        <Text color={Theme.Colors.primaryText}>Transaction No</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transactionReferenceNumber}</Text>
                    </Box>}
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Recipient Acct No</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.transactionType == 'D' ? transaction.refAccountNo:  transaction.accountNumber}</Text>
                    </Box>
                    {transaction.transactionType == 'D' && <VStack space={3}>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Recipient Name</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.recipientsName}</Text>
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Recipient Bank Name</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.recipientsBankName}</Text>
                    </Box>
                    </VStack>}
                    {transaction.transactionType == 'C' && <VStack space={3}>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Sender's Account Number</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.fromAccountNo ? transaction.fromAccountNo : 'N/A'}</Text>
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Sender's Name</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.fromCustomer ? transaction.fromCustomer : 'N/A'}</Text>
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Sender's Bank Name</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText} >{transaction.fromBank ? transaction.fromBank : 'N/A'}</Text>
                    </Box>
                    </VStack>}
                    
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Amount</Text>
                        <Currency bold={'bold'} color={Theme.Colors.tertiaryText} value={transaction.amount} />
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Narration</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transactionNarration}</Text>
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Status</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transStatusDesc}</Text>
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Transaction Type</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transactionType == 'D' ? 'DEBIT': 'CREDIT'}</Text>
                    </Box>
                    <Box>
                        <Text color={Theme.Colors.primaryText}>Date</Text>
                        <Text bold={'bold'} color={Theme.Colors.tertiaryText}>{transaction.transactionDate}</Text>
                    </Box>
                </VStack>
            </Box>
        </VStack>
        <Box mt={50}>
        <Button onPress={() => {
            shareReceipt()
        }} variant={'solid'} w={"full"} style={Shared.Button.primary}>Share Receipt</Button>
        </Box>
        </>
    );
};


export default TransactionSummary;