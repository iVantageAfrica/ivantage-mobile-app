import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, ScrollView, FlatList } from "native-base";
import { useAuthentication } from "../../queries/useAuthentication";

import MoreItem from '../../components/moreitem'

import Loader from '../../components/loader'

const FAQScreen = ({ navigation, route }) => {
    const { fetchData: getFAQs } = useAuthentication('faq', 'get');

    const [faqs, setFAQs] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getFAQData()
    }, [])

    const getFAQData = async() => {
        setIsLoading(true)
        await getFAQs({}).then(res => {
            if(res && res.data && res.data.success) {
                setFAQs(res.data.data)
            }
        })
        setIsLoading(false)
    }

    if(isLoading) {
        return <Loader />
    }
   
    return (
        <VStack style={styles.container}>
           <Box>
                <Box ml={3}>
                    <Heading mt={5} size="2xl" fontWeight="800" color="#ffffff" >
                         FAQs
                    </Heading>
                </Box>
               <FlatList
                mt={3}
                    data={faqs}
                    renderItem={({item, index}) => {
                        return (
                            <MoreItem key={index} imgIcon={<Icon mt={5} ml={5} size={5} color={'#ffffff'} as={FontAwesome} name="check" />}  title={item.question} subtitle={item.answer} />
                        )
                    }}
                />
            </Box>
        </VStack>

    );
};


export default FAQScreen;