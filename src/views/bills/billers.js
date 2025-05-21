import { Box, VStack, Text, FlatList, Heading, Image } from "native-base";
import styles from './styles'
import { useAuthentication } from "../../queries/useAuthentication";
import { useFocusEffect } from "@react-navigation/native";
import AlertBox from "../../components/alertbox";
import { useCallback, useEffect, useState } from "react";
import MoreItem from "../../components/moreitem";
import Loader from "../../components/loader";
import Theme from '../../themes';

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';


const BillersScreen = ({ navigation, route }) => {
    const { fetchParamData: fetchBillerByGroup } = useAuthentication('bill_group_biller', 'get', navigation, false);
    const group = route.params
    const [billers, setBillers] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        navigation.setOptions({ title: `${group.name}` })
        getBillerDataByGroup()
    }, [])

    const getBillerDataByGroup = async () => {
        setIsLoading(true)
        await fetchBillerByGroup({
            urlParams: {
                groupId: group.id
            }
        }).then(res => {
            setIsLoading(false)
            if (res && res.data && res.data.success) {
                setBillers(res.data.data)
                return
            }
            AlertBox.showErrorEx(res);
            return
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err);
            return
        })
    }

    const renderItem = ({ item, index }) => {
        return <MoreItem 
        imgIcon={<Image mb={3} mt={3} ml={7} width={35} resizeMode="contain" source={Theme.Icons.change_pin} alt={'partial'} />}
        key={item.id} onPress={() => navigation.navigate('bills.billers.packages', item)} title={item.name}  icon={<Icon size={5} color={'#ffffff'} as={FontAwesome} name="chevron-right" />} />
    }

    if(isLoading) {
        return <Box> <Loader /> </Box>
    }

    return (
        <VStack style={styles.container}>
            <Box ml={3} mb={3}>
                <Heading px={2} mt={3} fontWeight="600" color="#ffffff" >
                    Services
                </Heading>
            </Box>
            <Box mb={20}>
                {billers && <FlatList w={'full'} px={2} data={billers} renderItem={renderItem} />}
            </Box>
        </VStack>
    )
}

export default BillersScreen;