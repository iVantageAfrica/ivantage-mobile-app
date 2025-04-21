import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import Constants from 'expo-constants';

import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'

import { Box, VStack, HStack, Button, Heading, Image, Text, Link, Checkbox, Center } from "native-base";

import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'
import { useUser } from '../../context/usercontext'

const ProfileScreen = ({ navigation, route }) => {
    const { fetchData: getUser } = useAuthentication('user', 'get', navigation);
    const { authData, setAuthData } = useUser();
    const [isLoading, setLoading] = useState(false)

    useFocusEffect(useCallback(() => {
        getUserData()
    }, []))

    const getUserData = () => {
        setLoading(true)
        getUser({}).then(res => {
            setLoading(false)
            if (res && res.data.success) {
                const authDataCone = {...authData}
                authDataCone.user = res.data.data
                setAuthData(authDataCone)
                return
            }
            AlertBox.showErrorEx(res);
        }).catch(err => {
            setLoading(false)
            AlertBox.showErrorEx(err);
        })
    }

    if(isLoading) {
        return <Loader />
    }
   
    return (
        <VStack style={styles.container}>
           <Box px={2}>
                <Box ml={3} mb={5}>
                    <Heading mt={5} size="xl" fontWeight="800" color="#ffffff" >
                         Customer Profile
                    </Heading>
                </Box>
                <VStack space={2} px={5} mt={5}>
                    <VStack space={2}>
                        <Text style={{color: '#e9e9e9', fontSize: 13}}>Account Name</Text>
                        <Text style={{color: '#ffffff', fontSize: 19}}> {authData.user.firstname} {authData.user.surname}</Text>
                    </VStack>
                    <VStack space={2}>
                        <Text style={{color: '#e9e9e9', fontSize: 13}}>Phone Number</Text>
                        <Text style={{color: '#ffffff', fontSize: 19}}>{authData.user.phone}</Text>
                    </VStack>
                    <VStack space={2}>
                        <Text style={{color: '#e9e9e9', fontSize: 13}}>BVN</Text>
                        <Text style={{color: '#ffffff', fontSize: 19}}>{authData.user.bvn}</Text>
                    </VStack>
                    <VStack space={2}>
                        <Text style={{color: '#e9e9e9', fontSize: 13}}>Email</Text>
                        <Text style={{color: '#ffffff', fontSize: 19}}>{authData.user.email}</Text>
                    </VStack>
                </VStack>
            </Box>
        </VStack>

    );
};


export default ProfileScreen;