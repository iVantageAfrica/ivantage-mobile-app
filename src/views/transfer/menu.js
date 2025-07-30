import React from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';

import { Center, Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox } from "native-base";

import MoreItem from '../../components/moreitem'
import { getAppConfig } from '../../common/device';

import TransferMenuItem from '../../components/transfer_menu';

const { ToIvantageIcon, ToOtherBanksIcon, ToOwnAccountIcon, AccountManager} = Theme.SVG

import { useUser } from '../../context/usercontext'

const TransferMenuScreen = ({ navigation, route }) => {

    const { authData, setAuthData } = useUser();
    const displayName = getAppConfig().client_display_name
   
    return (
        <Box >
             <Box mt={3} mb={3} alignItems="center">
                <Text fontSize={16} fontWeight='normal' color={Theme.Colors.tertiaryTextColor}>Tap any of the options to transfer your fund.</Text>
            </Box>
        <VStack>
            <TransferMenuItem 
            onPress={() => navigation.navigate('savings_tranfers_to_own_acct')} 
            imgIcon={<ToIvantageIcon resizeMode="contain" width={30} height={40} />}
             icon={<Icon size={5} color={Theme.Colors.primaryText}
              as={FontAwesome} name="chevron-right" />} 
             title={'Transfer to own account'} mx={2} mb={1} />

            <TransferMenuItem onPress={() => navigation.navigate('savings_tranfers_to_other_acct',
                 {transfer_type: 'intra'})} imgIcon={<ToOtherBanksIcon width={30} height={40} />} 
                 icon={<Icon size={5} color={Theme.Colors.primaryText} as={FontAwesome} name="chevron-right" />} 
                 title={`Transfer to other ${displayName} Acc.`} />
            
            <TransferMenuItem onPress={() => navigation.navigate('savings_tranfers_to_other_acct',
                 {transfer_type: 'inter'})} imgIcon={<ToOwnAccountIcon width={30} 
                 height={40} />} icon={<Icon size={5} color={Theme.Colors.primaryText} as={FontAwesome} name="chevron-right" />} 
                 title={'Transfer to other bank Acc'} />
            
            <TransferMenuItem onPress={() => navigation.navigate('manage_beneficiaries')} 
            imgIcon={<ToIvantageIcon
             width={30} height={40} />} icon={<Icon size={5} color={Theme.Colors.primaryText} 
             as={FontAwesome} name="chevron-right" />} title={'Manage Beneficiaries'} />
        </VStack>
    </Box>
    );
};


export default TransferMenuScreen;