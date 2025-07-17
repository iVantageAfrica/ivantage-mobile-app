import React, { useRef, useMemo } from 'react';
import Theme from '../../themes';
import { Box, VStack, Text, Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { getAppConfig } from '../../common/device';
import TransferMenuItem from '../../components/transfer_menu';
import { useUser } from '../../context/usercontext';

const { ToIvantageIcon, ToOtherBanksIcon, ToOwnAccountIcon } = Theme.SVG;

const TransferMenuBottomSheet = ({ navigation, route, isOpen, onClose }) => {
    const { authData, setAuthData } = useUser();
    const displayName = getAppConfig().client_display_name;
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['40%'], []);

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={isOpen ? 0 : -1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onClose}
        >
            <Box mt={3} mb={3} alignItems="center">
                <Text fontSize={16} fontWeight='normal' color={Theme.Colors.tertiaryTextColor}>
                    Tap any of the options to transfer your fund.
                </Text>
            </Box>
            <VStack>
                <TransferMenuItem 
                    onPress={() => { onClose && onClose(); navigation.navigate('savings_tranfers_to_own_acct'); }}
                    imgIcon={<ToIvantageIcon resizeMode="contain" width={30} height={40} />}
                    icon={<Icon size={5} color={Theme.Colors.primaryText} as={FontAwesome} name="chevron-right" />} 
                    title={'Transfer to own account'} mx={2} mb={1} />

                <TransferMenuItem 
                    onPress={() => { onClose && onClose(); navigation.navigate('savings_tranfers_to_other_acct', {transfer_type: 'intra'}); }}
                    imgIcon={<ToOtherBanksIcon width={30} height={40} />} 
                    icon={<Icon size={5} color={Theme.Colors.primaryText} as={FontAwesome} name="chevron-right" />} 
                    title={`Transfer to other ${displayName} Acc.`} />
                
                <TransferMenuItem 
                    onPress={() => { onClose && onClose(); navigation.navigate('savings_tranfers_to_other_acct', {transfer_type: 'inter'}); }}
                    imgIcon={<ToOwnAccountIcon width={30} height={40} />} 
                    icon={<Icon size={5} color={Theme.Colors.primaryText} as={FontAwesome} name="chevron-right" />} 
                    title={'Transfer to other bank Acc'} />
                
                <TransferMenuItem 
                    onPress={() => { onClose && onClose(); navigation.navigate('manage_beneficiaries'); }}
                    imgIcon={<ToIvantageIcon width={30} height={40} />} 
                    icon={<Icon size={5} color={Theme.Colors.primaryText} as={FontAwesome} name="chevron-right" />} 
                    title={'Manage Beneficiaries'} />
            </VStack>
        </BottomSheet>
    );
};

export default TransferMenuBottomSheet; 