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

const { fetchData } = useAuthentication('getproperties', 'get');
const { fetchData: fetchHomeVestPropertyData } = useAuthentication('homevest_properties', 'get');
/**
 *  homevest_properties: '/client/properties',
    homevest_propert_by_id: '/client/properties/<property_id>',
 * @param {*} param0 
 * @returns 
 */

const PropertyListingScreen = ({ navigation, route, isEmbedded = false, propertySource = null }) => {
    const _timeout = useRef(null)
    const [properties, setProperties] = useState([])
    const [filtered_properties, setFilteredProperties] = useState([])
    const [searchText, setSearchText] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const transformRequestOptions = params => {
        let options = '';
        for (const key in params.filters) {
            options += `filters[${key}]=${params.filters[key]}&`;
        }
        return options ? options.slice(0, -1) : options;
    };

    const fetchHomeVestProperties = async () => {
        await fetchHomeVestPropertyData({})
            .then((res) => {
                setIsLoading(false)
                if (res.data && res.data.success) {
                    console.log("data is:", res.data.data)
                    setProperties(res.data.data)
                    setFilteredProperties(res.data)
                    return
                }
                AlertBox.showErrorEx(res)
            }).catch(err => {
                setIsLoading(false)
                setProperties([])
                setFilteredProperties([])
                AlertBox.showErrorEx(err)
            })
    }

    const fetchProperties = async (filter) => {
        setIsLoading(true)
        setProperties([])
        setFilteredProperties([])
        await fetchData({
            params: { filters: filter },
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


    const propertyDataSources = {
        default: fetchProperties,
        homevest: fetchHomeVestProperties
    }

    /**
     * Define property data source handler
     */
    const propertyAPIFxn = propertySource && propertyDataSources[propertySource] ? propertyDataSources[propertySource] : propertyDataSources.default

    useEffect(() => {
        const interactionPromise = InteractionManager.runAfterInteractions(() => propertyAPIFxn({}));
        return () => interactionPromise.cancel();
    }, [])

    const setFilterView = () => {
        navigation.navigate('PropertyDetailScreen')
    }

    const goToDetail = (property) => {
        navigation.navigate('PropertyDetailScreen', { property, isEmbedded })
    }

    const filterPropertyView = (str) => {
        if (_timeout && _timeout.current) { clearTimeout(_timeout.current) }
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
            return (item.name ?? item.title ?? '').toString().toLowerCase().indexOf(searchText) > -1
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
            <Property isEmbedded={isEmbedded} likeIcon={likeIcon} onPress={() => goToDetail(properties[index])} property={properties[index]} />
            {index < properties.length && <Property isEmbedded={isEmbedded} likeIcon={likeIcon} onPress={() => goToDetail(properties[index + 1])} property={properties[index + 1]} />}
        </HStack>)
    }

    if (isLoading) {
        return <Loader />
    }

    const likeIcon = <Icon size={5} color={'#677585'} as={FontAwesome} name="heart" />

    return (

        <VStack safeArea style={styles.container}>
            <Box px={4} mb={5}>
                <HStack space={1}>
                    <Input onChangeText={(text) => filterPropertyView(text)} variant={'rounded'} placeholder={'Find your dream home'} w={!isEmbedded ? '5/6' : 'full'} style={{ paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 5, backgroundColor: '#415367', color: '#ffffff', fontSize: 12 }} />
                    {!isEmbedded && <Button ml={2} onPress={() => {
                        navigation.navigate('FilterViewScreen', { callback: handleFilterAction })
                    }} style={Shared.Button.primary} variant={'outline'} ><Icon color="white" as={<FontAwesome name={'search'} />} size="sm" /></Button>}
                    {/* <Button onPress={() => setModalVisible(true)} mt={3} h={2} variant={'ghost'} size={'sm'}><Icon size={6} color={'#ffffff'} as={FontAwesome} name="filter" /></Button> */}
                </HStack>
            </Box>
            <ScrollView contentInset={{ bottom: isEmbedded ? 0 : 80 }} ml={1} mr={1}>
                {filtered_properties && filtered_properties.length > 0 && filtered_properties.map((p, i) => {
                    return renderItem({ item: p, index: i })
                })}
            </ScrollView >

        </VStack>
    );
};


export default PropertyListingScreen;