import React, { useState, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { useAuthentication } from "../../queries/useAuthentication";
import { Box, VStack, HStack, Button, FormControl, FlatList, Heading, Input, Image, Text, Select, Center, ScrollView } from "native-base";
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import Utils from '../../common/utils'

const FilterViewScreen = ({ navigation, route }) => {
    const {fetchData: fetchPropertyFilters} = useAuthentication('filter_refs', 'get', navigation)
    const {fetchParamData: fetchPropertyFilterByKey} = useAuthentication('property_reference', 'get', navigation)
    const [isLoading, setIsLoading] = useState(true)
    const [filterDataRef, setFilterDataRef] = useState(null)
    const [filterMapObj, setFilterMapObj] = useState(new Map())

    const fieldMap = {state: 'district'}

    useEffect(() => {
        fetchPropertyFiltersData()
    }, [filterMapObj])

    const fetchPropertyFiltersData = async() => {
        setIsLoading(true)
        await fetchPropertyFilters({})
        .then(resp => {
            if (resp.data && resp.data.success) {
                const refs = resp.data.data
                if('approval' in refs){ delete refs['approval']}
                setFilterDataRef(refs)
            }
            setIsLoading(false)
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err)
        })
    }

    const fetchPropertyFiltersDataByKey = async(field, filters) => {
        await fetchPropertyFilterByKey({
            params: {filters},
            paramsSerializer: (_params) => Utils.transformRequestOptions(_params),
            urlParams: {field_key: field}
        })
        .then(resp => {
            if (resp.data && resp.data.success) {
                const refs = resp.data.data
                filterDataRef[field] = refs
                setFilterDataRef({...filterDataRef})
            }
        }).catch(err => {
            AlertBox.showErrorEx(err)
        })
    }

    const getFieldValue = (key) => {
        if(filterMapObj.has(key)) {
            return filterMapObj.get(key)
        }
        return ''
    }

    const applyFilter = () => {
        const filter = {}
        filterMapObj.forEach((v,k) => {
            filter[k] = v
        })
        // This should be reviewed. Navigation was slow, hence why it was implemented this way
        /**
         * Non-serializable values were found in the navigation state. Check:
           FilterViewScreen > params.callback (Function)
           This can break usage such as persisting and restoring state. This might happen if you passed non-serializable 
           values such as function, class instances etc. in params. If you need to use components with callbacks in your options, 
           you can use 'navigation.setOptions' instead. 
           See https://reactnavigation.org/docs/troubleshooting#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state for more details.
         */
        if(route.params.callback && typeof route.params.callback === 'function') {
            route.params.callback(filter)
        }
        navigation.goBack()
        return
    }

    const labelSwap = (item) => {
        const swapList = {'district' : 'area'}
        if(item in swapList) {
            return swapList[item]
        }
        return item
    }

    const getInputType = (item) => {
        if(filterDataRef[item].push) {
            return (
                <Select w={'full'} onValueChange={(v) => {
                    filterMapObj.set(item, v)
                    setFilterMapObj(filterMapObj)
                    if(item in fieldMap) {
                        fetchPropertyFiltersDataByKey(fieldMap[item], {[item]: v})
                    }
                }} value={getFieldValue(item)} placeholder={`Select ${labelSwap(item)}`} bgColor={'#ffffff'} borderRadius={20} style={{ ...Shared.Select.default }} variant={'rounded'}>
                    {filterDataRef[item] && filterDataRef[item].map((y, i) => <Select.Item key={i} label={y} value={y} />)}
                </Select>
            )
        }
        return (<Input w={'full'} onChangeText={(v) => {
            filterMapObj.set(item, v)
            setFilterMapObj(filterMapObj)
        }} value={''} borderRadius={20} multiline={true} h={100} placeholder={'Description'} bgColor={'#ffffff'} style={{ ...Shared.Select.default }}  />
        )
    }

    const getBedroomFilter = () => {
        // This is a hack for now. It came as after thought from the PM
        return (
            <FormControl mb={2}>
            <FormControl.Label _text={{
                color: "#ffffff",
                fontWeight: "medium",
                fontSize: "sm"
            }}>Bedrooms</FormControl.Label>
            <Input
                    placeholder='1'
                    keyboardType='numeric'
                    onChangeText={text => {
                        filterMapObj.set('bedrooms', text)
                    }}
                    value={filterMapObj.get('bedrooms')}
                    style={Shared.TextInput.default} variant={'rounded'} InputRightElement={<Button size="s" _text={{ color: '#ffffff' }} variant={'ghost'} rounded="none" w="2/6" h="full" >
                        {"Bedrooms"}
                    </Button>} />
        </FormControl>
        )
    }

    const getPriceFilter = () => {
        // This is a hack for now. It came as after thought from the PM
        return (
            <FormControl mb={2}>
            <FormControl.Label _text={{
                color: "#ffffff",
                fontWeight: "medium",
                fontSize: "sm"
            }}>Maximum Price</FormControl.Label>
            <Input
                    placeholder='1'
                    keyboardType='numeric'
                    onChangeText={text => {
                        filterMapObj.set('price_range_less', text)
                    }}
                    value={filterMapObj.get('price_range_less')}
                    style={Shared.TextInput.default} variant={'rounded'} />
        </FormControl>
        )
    }
    const getPriceMinFilter = () => {
        // This is a hack for now. It came as after thought from the PM
        return (
            <FormControl mb={2}>
            <FormControl.Label _text={{
                color: "#ffffff",
                fontWeight: "medium",
                fontSize: "sm"
            }}>Minimum Price</FormControl.Label>
            <Input
                    placeholder='1'
                    keyboardType='numeric'
                    onChangeText={text => {
                        filterMapObj.set('price_range_greater', text)
                    }}
                    value={filterMapObj.get('price_range_greater')}
                    style={Shared.TextInput.default} variant={'rounded'} />
        </FormControl>
        )
    }

    if(isLoading) {
        return <Loader />
    }

    return (<ScrollView contentInset={{bottom: 100}} safeArea style={styles.container} px={5}>
        <VStack>
            {getPriceFilter()}
            {getPriceMinFilter()}
        {filterDataRef && Object.keys(filterDataRef).map((filterItem, index) => {
                return (
                <Box  key={index}>
                <FormControl key={index} mb={2}>
                    <FormControl.Label type={'Email'} _text={{
                        color: "#ffffff",
                        fontWeight: "medium",
                        fontSize: "sm"
                    }}>{Utils.capitalizeFirstLetter(labelSwap(filterItem))}</FormControl.Label>
                    {getInputType(filterItem)}
                </FormControl>
                {filterItem=='type'  && getBedroomFilter()}
                </Box>)
            })}
        </VStack>
            <VStack mt={10}>
                <Box px={1} marginBottom={5} alignItems={'center'} justifyContent={'center'} space={5}>
                <Button variant={'solid'} w={'full'} size={'lg'} style={Shared.Button.primary} onPress={applyFilter}>Apply Filter</Button>
                </Box>
                </VStack>
    </ScrollView>)
}

export default FilterViewScreen