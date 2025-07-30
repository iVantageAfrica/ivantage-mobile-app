import React, { useEffect, useState } from "react";
import { Box, Button, Actionsheet, HStack, Heading, Text, VStack, useDisclose } from "native-base"
import { View, RefreshControl, ScrollView, TouchableOpacity, Share } from "react-native"
import QRCodeStyled from 'react-native-qrcode-styled';
import * as Clipboard from "expo-clipboard";

import Shared from "../../themes/shared"
import { useAuthentication } from "../../queries/useAuthentication";

import Loader from '../../components/loader'
import AlertBox from '../../components/alertbox';
import themes from "../../themes";
import Colors from "../../themes/ivantage/colors";

const { fetchData: getAffiliateDetail } = useAuthentication(
    "affiliate_detail",
    "get"
);

const AffiliateReferralsScreen = ({ navigation, route }) => {
    const { fetchData: getAffiliateReferrals } = useAuthentication('affiliate_referrals', 'get', navigation);
    const [loading, setLoading] = useState(false)
    const [referrals, setReferrals] = useState([])
    const [refreshing, setRefreshing] = useState(false);
    const [affiliateInfo, setAffiliateInfo] = useState(false);

    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclose();

    useEffect(() => {
        onClose()
        setLoading(true);
        (async () => {
            await getMyReferrals()
            await getDetail()
            setLoading(false);
        })()
    }, [])

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        (async () => {
            await getMyReferrals()
            await getDetail()
            setRefreshing(false);
        })()
    }, []);

    const copyToClipboard = async (type, text) => {
        await Clipboard.setStringAsync(text);
        AlertBox.showSuccess(`Referral ${type} copied successfully.`, "Copied");
    };

    const shareReferrerCode = async () => {
        if (!affiliateInfo?.referralCode) { return }
        try {
            await Share.share({
                message:
                    `I am planning my way to becoming a home owner!
Sign up with my link to join me on this journey - ${getRefrralLink()}`,
            });
        } catch (error) {

        }
    }

    const getDetail = async () => {
        setLoading(true);
        const resp = await getAffiliateDetail({});
        if (resp && resp.data && resp.data.success) {
            setAffiliateInfo(resp.data.data);
        }
        setLoading(false);
    };

    const getMyReferrals = async () => {
        try {
            const resp = await getAffiliateReferrals()
            if (resp && resp.data && resp.data.success) {
                setReferrals(resp.data.data)
                return
            }
            AlertBox.showErrorEx(resp)
            return
        } catch (error) {

        }
        AlertBox.showError('Unable to complete this request. Please try again later.', 'Failed Request')
    }

    const getRefrralLink = () => {
        if (affiliateInfo?.referralCode) {
            return affiliateInfo?.referralLink ?? `https://ibs.imperialmortgagebank.com/signup/new?ref=${affiliateInfo.referralCode}`
        }
        return '';
    }

    const getReferralType = (item) => {
        return (item.referralTarget || "new-investment-request").split('-').join(' ')
    }

    if (loading) {
        return <Loader />
    }

    return (
        <View style={{ margin: 10 }}>
            {affiliateInfo?.referralCode && <VStack space={3}>
                <HStack justifyContent={'space-between'}>
                    <Box><Text color={'#ffffff'}>Details</Text></Box>
                    <Button onPress={onOpen} variant={'ghost'} colorScheme={'amber'}>QR Code</Button>
                </HStack>
                <TouchableOpacity onPress={() => copyToClipboard('code', affiliateInfo?.referralCode)}>
                    <Box>
                        <Text mb={1} color={Colors.backgroundColorAlt}>Referral Code</Text>
                        <Box bgColor={Colors.backgroundColorAlt3} p={3}>
                            <Text fontSize={16} color={'#ffffff'}>{affiliateInfo?.referralCode}</Text>
                            <Text color={'#ffffff'} fontSize={9} >Tap to copy</Text>
                        </Box>
                    </Box>
                </TouchableOpacity>
                <TouchableOpacity onPress={shareReferrerCode}>
                    <Box>
                        <Text mb={1} color={Colors.backgroundColorAlt}>Referral Link</Text>
                        <Box bgColor={Colors.backgroundColorAlt3} p={3}>
                            <Text color={Colors.primaryContrast}>{getRefrralLink()}</Text>
                            <Text color={'#ffffff'} fontSize={9} >Tap to share</Text>
                        </Box>
                    </Box>
                </TouchableOpacity>
            </VStack>}
            <Box mt={5}><Text color={Colors.backgroundColorAlt}>Referral Activities</Text></Box>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                {referrals && referrals.length > 0 && referrals.map((referral) => (
                    <Box key={referral.objectId} mb={2} p={3}
                        style={{ borderColor: themes.Colors.backgroundColorAlt, borderWidth: 1, borderRadius: 5 }}>
                        <HStack space={2}>
                            <Box flex={3}>
                                <Text style={{ textTransform: 'capitalize' }} color={'amber.600'}>{getReferralType(referral)}</Text>
                                <Text style={{ textTransform: 'uppercase' }} color={'#ffffff'}>{referral.status}</Text>
                            </Box>
                            <Box flex={1}>
                                <Text fontSize={11} color={'#ffffff'}>{referral.createdAt}</Text>
                            </Box>
                        </HStack>
                    </Box>
                ))}
                {referrals?.length === 0 && <Box mt={5}>
                    <Box>
                        <Box bgColor={Colors.backgroundColorAlt3} p={3}>
                        <Text color={Colors.backgroundColorAlt}>No activity on your referral account.</Text>
                        </Box>
                    </Box>
                    </Box>}
            </ScrollView>
            <Actionsheet isOpen={isOpen} onClose={onClose}>
                <Actionsheet.Content style={{ backgroundColor: Colors.backgroundColor }} >
                    <Box>
                        <QRCodeStyled
                            data={getRefrralLink()}
                            style={{ backgroundColor: Colors.backgroundColor }}
                            padding={20}
                            pieceBorderRadius={5}
                            color={Colors.backgroundColorLight}
                            pieceSize={8}
                        />
                    </Box>
                </Actionsheet.Content>
            </Actionsheet>
        </View>

    )
}

export default AffiliateReferralsScreen