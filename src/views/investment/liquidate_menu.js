import React, {useState} from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox } from "native-base";

import MoreItem from '../../components/moreitem'

const LiquidationMenuScreen = ({ navigation, route }) => {
    const [selectedInvestment, setSelectedInvestment] = useState(route.params.selectedInvestment)
    
    return (
        <VStack px={3}  style={styles.container}>
           <Box>
                <Box ml={3} mb={5}>
                    <Heading mt={5} size="2xl" fontWeight="800" color="#ffffff" >
                         Liquidation
                    </Heading>
                </Box>
                <VStack>
                    <MoreItem onPress={() => navigation.navigate('investment_liquidation_partial', {selectedInvestment})} imgIcon={<Image mb={3} mt={5} width={35} resizeMode="contain" source={Theme.Icons.liquidate_partial} alt={'partial'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Partial Liquidation'} />
                    <MoreItem onPress={() => navigation.navigate('investment_liquidation_full', {selectedInvestment})} imgIcon={<Image mb={3} mt={5} width={35} resizeMode="contain" source={Theme.Icons.liquidate_full} alt={'full'} />} icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} title={'Full Liquidation'} />
                </VStack>
            </Box>
        </VStack>

    );
};


export default LiquidationMenuScreen;