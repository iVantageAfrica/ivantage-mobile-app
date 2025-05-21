import React, { useEffect, useState } from "react";
import { VStack, Box, Image, Text, HStack, Button, Skeleton, IconButton, Icon, Flex, ScrollView, Progress } from "native-base";
import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

import Theme from "../../themes";
import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from "../alertbox";
import Currency from "../currency";

const { HomevestHomeIcon1, HomevestDash } = Theme.SVG

const HomeVestCard = ({ navigation, hasAccount, onPress = null }) => {

    const { fetchData: fetchSavingsPlanAPI } = useAuthentication('homevest_savings_plan', 'get', navigation, false);
    const [savingsPlans, setSavingsPlans] = useState([])

    useEffect(() => {
        fetchSavingsPlan()
    }, [hasAccount])



    const fetchSavingsPlan = async () => {
        return fetchSavingsPlanAPI({}).then(async (res) => {
            if (res && res.data && res.data.success) {
                setSavingsPlans(res?.data?.data ?? [])
                return
            }
            AlertBox.showErrorEx(res);
        }).catch(err => {
            AlertBox.showErrorEx(err);
        })
    }

    const getProgress = (plan) => {
        const total = plan.savings_entries.length
        const completed = plan.savings_entries.filter(f => f.status !== 'pending').length
        const progress = Math.min((completed / total) * 100, 100);
        return progress < 3 ? 3 : progress
    }

    if (savingsPlans.length === 0) {
        return (<Box mx={2}>
            <VStack>
                <TouchableOpacity onPress={() => {
                    if(!hasAccount) {
                        AlertBox.showError("There is no account associated with your profile yet. Please create a new account or link your existing iVantage Homes Mortage bank account if you already have one.", 'No Account')
                        if(onPress && typeof onPress === 'function') {
                            onPress()
                        }
                    }else {
                        navigation.navigate('homevest.landing', {})
                    }
                }}>
                    <HomevestDash width={Dimensions.get('window').width - 4} height={150} />
                </TouchableOpacity>
            </VStack>
        </Box>)
    }

    return (<Box  my={5}>
        <ScrollView horizontal>
            <Flex  direction="row">
                {savingsPlans.map((plan, indx) => {
                    return (
                        <TouchableOpacity key={plan.id} style={{ ...styles.container }} onPress={() => navigation.navigate('homevest.dashboard', { plan })}>
                            <HStack >
                                <Box mr={2} w={10}>
                                    <HomevestHomeIcon1 width={40} height={40} />
                                </Box>
                                <VStack flex={1} space={2}>
                                    <Box>
                                        <Text fontSize={18} color={'gray.300'} fontWeight={'bold'}>HomeVest Plan #{indx + 1}</Text>
                                    </Box>
                                    <Box>
                                        <Text color={'gray.500'}>Contribution Target </Text>
                                        <Currency fontWeight={'bold'} fontSize={'xl'} color={'gray.300'} value={Number(plan.equity_amount)} />
                                    </Box>
                                    <Box mt={3}>
                                        <Progress size="sm" colorScheme="emerald" value={getProgress(plan)} />
                                    </Box>
                                </VStack>
                                <Box justifyContent={'center'}>
                                    <IconButton icon={<Icon size={14} color={'orange.100'} as={FontAwesome} name={'chevron-right'} />} size={4} variant={'ghost'} />
                                </Box>
                            </HStack>
                        </TouchableOpacity>
                    )
                })}
            </Flex>
        </ScrollView>
    </Box>)
}

const styles = StyleSheet.create({
    container: {
        height: 150,
        borderWidth: 1,
        borderColor: Theme.Colors.backgroundColorAlt,
        marginBottom: 5,
        width: Dimensions.get('window').width - 4,
        marginTop: 7,
        marginHorizontal: 4,
        borderRadius: 10,
        padding: 15,
        backgroundColor: Theme.Colors.backgroundColorAlt3,
        borderColor: Theme.Colors.backgroundColor,
    },
});

export default HomeVestCard;