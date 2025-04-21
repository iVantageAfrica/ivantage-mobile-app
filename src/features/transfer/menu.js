import React from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox } from "native-base";

import MoreItem from '../../components/moreitem'
import { getAppConfig } from '../../common/device';

const { AccountManager, IvantageLogo, Bank} = Theme.SVG

import { useUser } from '../../context/usercontext'

const TransferMenuScreen = ({ navigation, route }) => {

    const { authData, setAuthData } = useUser();
    const displayName = getAppConfig().client_display_name
    
   
    return (
        <Box >
        <Box ml={3} mb={5}>
            <Heading size="2xl" fontWeight="800" color="#ffffff" >
                 Fund Transfer
            </Heading>
        </Box>
        <VStack>
            <MoreItem onPress={() => navigation.navigate('savings_tranfers_to_own_acct')} imgIcon={<IvantageLogo marginTop={5} marginLeft={20} width={30} height={40} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Transfer to own account'} />
            <MoreItem onPress={() => navigation.navigate('savings_tranfers_to_other_acct', {transfer_type: 'intra'})} imgIcon={<Bank marginTop={5} marginLeft={20} width={30} height={40} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={`Transfer to other ${displayName} Acc.`} />
            <MoreItem onPress={() => navigation.navigate('savings_tranfers_to_other_acct', {transfer_type: 'inter'})} imgIcon={<AccountManager marginTop={5} marginLeft={20} width={30} height={40} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Transfer to other bank Acc'} />
            <MoreItem onPress={() => navigation.navigate('manage_beneficiaries')} imgIcon={<AccountManager marginTop={5} marginLeft={20} width={30} height={40} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Manage Beneficiaries'} />
        </VStack>
    </Box>
    );
};


export default TransferMenuScreen;