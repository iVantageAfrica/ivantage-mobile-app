import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native'
import { View, Pressable, StyleSheet, InteractionManager } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import { Box, VStack, HStack, Button, Icon, FlatList, Heading, Input, Image, Text, Link, Center, ScrollView } from "native-base";
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import Property from '../../components/property'
import Currency from '../../components/currency'



const AffordabilityListingScreen = ({ navigation, route }) => {
    const { fetchData } = useAuthentication('getproperties', 'get', navigation);
    const {affordability_amt, amt, loanTerm, repayment} = route.params
    const monthly_repayment = repayment
    const _timeout = useRef(null)
    const [properties, setProperties] = useState([])
    const [filtered_properties, setFilteredProperties] = useState([])
    const [searchText, setSearchText] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const interactionPromise = InteractionManager.runAfterInteractions(() =>  fetchProperties({}));
        return () => interactionPromise.cancel();
    }, [])

    const transformRequestOptions = params => {
        let options = '';
        for (const key in params.filters) {
            options += `filters[${key}]=${params.filters[key]}&`;
        }
        return options ? options.slice(0, -1) : options;
     };

    const fetchProperties = async (filter) => {
        setIsLoading(true)
        setProperties([])
        setFilteredProperties([])
        filter['price_range_less'] = affordability_amt
        await fetchData({
            params: {filters: filter},
            paramsSerializer: (_params) => transformRequestOptions(_params)
        }).then((res) => {
            setIsLoading(false)
            if (res.data && res.data.success) {
                setProperties(res.data.data)
                setFilteredProperties(res.data.data)
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err)
        })
    }

    const setFilterView = () => {
        navigation.navigate('PropertyDetailScreen')
    }

    const goToDetail = (property) => {
        navigation.navigate('PropertyDetailScreen', { property })
    }

    const filterPropertyView = (str) => {
        if(_timeout && _timeout.current) { clearTimeout(_timeout.current) }
        if (!str || str.length == 0) {
            setFilteredProperties(properties)
            return
        }
        _timeout.current = setTimeout(() => {
            clearTimeout(_timeout.current)
            str = str.toLowerCase()
            filterPropertyViewList(str)
        }, 100)
    }

    const filterPropertyViewList = (searchText) => {
        if (!searchText || searchText.length == 0) {
            setFilteredProperties(properties)
            return
        }
        const filtered = properties.filter(item => {
            return item.name.toString().toLowerCase().indexOf(searchText) > -1
        })
        setFilteredProperties(filtered)
    }

    const handleFilterAction = (filter) => {
        fetchProperties(filter)
    }

    const renderItem = ({ item, index }) => {
        if (index > 0 && index % 2 != 0) {
            return null
        }
        return (<HStack mb={3} key={index} borderRadius={10} space={3}>
            <Property likeIcon={likeIcon} onPress={() => goToDetail(properties[index])} property={properties[index]} />
            {index < properties.length && <Property likeIcon={likeIcon} onPress={() => goToDetail(properties[index + 1])} property={properties[index + 1]} />}
        </HStack>)
    }

    if (isLoading) {
        return <Loader />
    }

    const likeIcon = <Icon size={5} color={'#677585'} as={FontAwesome} name="heart" />

    return (

        <VStack style={styles.container}>
            <Box  >
                <Heading px={5} size="xl" fontWeight="800" color="#ffffff" >
                    Affordability Calculator
                </Heading>
                <Box style={{borderBottomWidth: 1, paddingBottom: 10, borderBottomColor: Theme.Colors.backgroundColorAlt}}>
                    <VStack px={5} mt={3}>
                        <HStack space={2}>
                            <Box w={'1/2'} style={{backgroundColor: Theme.Colors.backgroundColorAlt, padding:10, borderRadius: 10}}>
                                <Center>
                                    <Text mb={2} style={styles.text}>Maximum Loan Amount</Text>
                                    <Currency style={styles.text_lg} value={affordability_amt} />
                                </Center>
                            </Box>
                            <Box w={'1/2'} style={{backgroundColor: Theme.Colors.backgroundColorAlt, padding:10, borderRadius: 10}}>
                                <Center>
                                    <Text mb={2} style={styles.text}>Monthly Repayment</Text>
                                    <Currency style={styles.text_lg} value={monthly_repayment} />
                                </Center>
                            </Box>
                        </HStack>
                    </VStack>
                    <VStack px={5} mt={3}>
                        <HStack space={2}>
                            <Box w={'1/2'} style={{backgroundColor: Theme.Colors.primaryContrast, padding:5, borderRadius: 10}}>
                                <Center>
                                    <Text style={styles.text} >Interest rate: 19%</Text>
                                </Center>
                            </Box>
                            <Box w={'1/2'} style={{backgroundColor: Theme.Colors.primaryContrast, padding:5, borderRadius: 10}}>
                                <Center>
                                    <Text style={styles.text} >Tenor: {loanTerm} {loanTerm > 1 ? 'Years': 'Year'}</Text>
                                </Center>
                            </Box>
                        </HStack>
                    </VStack>
                </Box>
                
            </Box>
            <Box px={4} mt={5} mb={5}>
                <HStack space={1}>
                    <Input onChangeText={(text) => filterPropertyView(text)} variant={'rounded'} placeholder={'Find your dream home'} w={'5/6'} style={{ paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 5, backgroundColor: '#415367', color: '#ffffff', fontSize: 12 }} />
                    <Button ml={2} onPress={() => {
                        navigation.navigate('FilterViewScreen', {callback: handleFilterAction})
                    }} style={Shared.Button.primary} variant={'outline'} ><Icon color="white" as={<FontAwesome name={'search'} />} size="sm" /></Button>
                    {/* <Button onPress={() => setModalVisible(true)} mt={3} h={2} variant={'ghost'} size={'sm'}><Icon size={6} color={'#ffffff'} as={FontAwesome} name="filter" /></Button> */}
                </HStack>
            </Box>
            <ScrollView style={{ marginBottom: 10 }} ml={1} mr={1}>
                {filtered_properties && filtered_properties.length > 0 && filtered_properties.map((p, i) => {
                    return renderItem({ item: p, index: i })
                })}
            </ScrollView >
           
        </VStack>
    );
};


export default AffordabilityListingScreen;