import React, { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import styles from './styles'
import { TouchableWithoutFeedback, TouchableOpacity, View, ScrollView, FlatList, Share, Platform } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, Icon, HStack, Button, Heading, Image, Text, Link } from "native-base";
import BottomSheet, { useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';
import AlertBox from '../../components/alertbox';
import { useAuthentication } from "../../queries/useAuthentication";
import Currency from '../../components/currency'
import Colors from '../../themes/ivantage/colors';



const PropertyDetailScreen = ({ navigation, route }) => {
    const { lockDownProperty } = useAuthentication('lockdownproperty', 'get', navigation);
    const isAndroid = Platform.OS !== 'ios'
    const [openState, setOpenState] = useState(0)
    const [currentImage, setCurrentImage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const property = route.params.property
    const isEmbedded = route.params.isEmbedded ?? false

    console.log("isEmbedded", isEmbedded);

    const animationConfigs = useBottomSheetTimingConfigs({
        duration: 200,
        easing: Easing.linear,
    });

    useEffect(() => {
        console.log(property)
        if (property && property.images & property.images.length > 0) {
            setCurrentImage(property.images[0]?.url ?? property.images[0])
        }
    }, [])

    // ref
    const bottomSheetRef = useRef();

    // variables
    const snapPoints = useMemo(() => [isAndroid ? 210 : 300, 500], []);

    // callbacks
    const handleSheetChanges = useCallback((index) => {

    }, []);

    const shareProperty = async () => {
        if (!currentImage) { return }
        try {
            await Share.share({
                message:
                    `Property: ${property.name}, ${property.features.join(',')} , see more here ${currentImage}`,
            });
        } catch (error) {

        }

    }

    const lockDownPropertyHandler = () => {
        setIsLoading(true)
        lockDownProperty(property).then(async (res) => {
            setIsLoading(false)
            if (res.data && res.data.success) {
                AlertBox.showSuccess("A request to lock down this property has been sent. You will be contacted shortly.")
                return
            }
            AlertBox.showErrorEx(res)
        }).catch(err => {
            setIsLoading(false)
            AlertBox.showErrorEx(err)
        })
    }

    const getState = (property) => {
        if (property.district && property.state) {
            return `${property.district}, ${property.state}`
        }
        const { state: states, location: locations } = property
        if (!states?.length && !locations?.length) { return '' }
        return `${locations[0].name}, ${states[0].name}`
    }

    const goToMortgage = (property) => {
        navigation.navigate('NewMortgageScreen', { property })
    }

    const renderItem = ({ item, index }, property) => {
        return (
            <TouchableOpacity
                key={index}
                onPress={() => {
                    setCurrentImage(item.url ?? item)
                }}
            >
                <Image key={index} style={{ width: 100, height: 100, marginRight: 7 }} borderTopRadius={3} resizeMode={'cover'} source={{
                    uri: (item.url ?? item)
                }} fallbackSource={{
                    uri: "https://www.w3schools.com/css/img_lights.jpg"
                }} alt={property.name ?? property.title} />
            </TouchableOpacity>)
    }

    return (
        <>
            <VStack style={styles.container}>
                <Box>
                    <VStack >
                        <TouchableWithoutFeedback
                            onPress={() => {
                                setOpenState(openState == 1 ? 0 : 1)
                            }}
                        >
                            <Box>
                                <Image w={'full'} h={400} borderTopRadius={10} resizeMode={'cover'} source={{
                                    uri: (currentImage && currentImage.length > 0) ? currentImage : (property.images[0].url ?? property.images[0])
                                }} fallbackSource={{
                                    uri: "https://www.w3schools.com/css/img_lights.jpg"
                                }} alt={property.name ?? property.title} />
                                <Icon shadow={3} size={8} style={{ position: 'absolute', bottom: 20, right: 20 }} color={'#000000'} as={FontAwesome} name="info-circle" />
                            </Box>

                        </TouchableWithoutFeedback>
                    </VStack>
                    <FlatList removeClippedSubviews={true} initialNumToRender={5} style={{ marginTop: 7 }} horizontal={true} data={property.images} renderItem={(d) => renderItem(d, property)} />
                </Box>
            </VStack>
            <BottomSheet
                backgroundStyle={{ backgroundColor: Theme.Colors.backgroundColor }}
                ref={bottomSheetRef}
                index={openState}
                enablePanDownToClose={true}
                enableContentPanningGesture={true}
                snapPoints={snapPoints}
                animationConfigs={animationConfigs}
                onChange={handleSheetChanges}
            >
                <View style={styles.container}>
                    <Box px={3}>
                        <HStack mb={4}>
                            <Box w={'full'} >
                                <VStack mb={2}>
                                    <HStack>
                                        <Box style={{ flex: 5 }}>
                                            <HStack space={2}>
                                                <Box mb={5} style={{ width: 55, height: 25, borderRadius: 10, backgroundColor: '#ffffff', justifyContent: 'center' }}><Text style={{ color: '#000000', fontSize: 11, alignSelf: 'center' }}>{property.status || (property.isActive ? 'Available' : 'Not Available')}</Text></Box>
                                                <Box mb={5} style={{ width: 85, height: 25, borderRadius: 10, backgroundColor: '#677585', justifyContent: 'center' }}><Text style={{ color: '#ffffff', fontSize: 11, alignSelf: 'center' }}>{property.code ?? property.property_code}</Text></Box>
                                                {property.type && <Box mb={5} style={{ minWidth: 15, paddingRight: 7, paddingLeft: 7, height: 25, borderRadius: 10, backgroundColor: '#677585', justifyContent: 'center' }}><Text style={{ color: '#ffffff', fontSize: 11, alignSelf: 'center' }}>{property.type}</Text></Box>}
                                            </HStack>
                                        </Box>
                                        <Box style={{ justifyContent: 'flex-end' }}>
                                            <Icon onPress={() => shareProperty()} style={{ flex: 1 }} size={6} color={'#677585'} as={FontAwesome} name="share" />
                                        </Box>
                                    </HStack>

                                    <HStack >
                                        <Icon size={4} color={Theme.CustomTheme['color-active-text-alt']} as={FontAwesome} name="map-marker" />
                                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '300', color: Theme.CustomTheme['color-active-text-alt'] }}>{getState(property)}</Text>
                                    </HStack>
                                    <HStack w={'full'}>
                                        <Box style={{ flex: 3 }}>
                                            <Text style={{ fontSize: 18, color: '#ffffff', fontWeight: 'bold', }}>{property.name ?? property.title}</Text>
                                        </Box>
                                        <Box style={{ flex: 2, justifyContent: 'flex-start' }}>
                                            <Currency style={{ fontSize: 16, color: '#ffffff', fontWeight: 'bold', alignSelf: 'flex-end' }} value={property.price} />
                                        </Box>
                                    </HStack>

                                </VStack>
                                <VStack>
                                    <HStack space={2}>
                                        {property.features && property.features.map((feature, ind) => {
                                            if (ind > 2) {
                                                return null
                                            }
                                            return (
                                                <Box key={ind}><Text style={{ color: '#677585' }}>. {feature}</Text></Box>
                                            )
                                        })}
                                    </HStack>
                                </VStack>
                                <VStack mt={5}>
                                    <HStack space={4}>
                                        <Box style={{ flex: 2 }}><Button disabled={isEmbedded} onPress={() => {
                                            lockDownPropertyHandler(property)
                                        }} isLoading={isLoading} isLoadingText={'Sending Request...'} size={'sm'} style={{ backgroundColor: '#677585' }}>Lock Down</Button></Box>
                                        {!isEmbedded && <Box style={{ flex: 2, justifyContent: 'flex-start' }}><Button onPress={() => goToMortgage(property)} size={'sm'} style={{ backgroundColor: Theme.CustomTheme['color-active-text'] }}>Buy with a mortgage</Button></Box>}
                                    </HStack>
                                    {isEmbedded && <Box bgColor={Colors.backgroundColorAlt3} p={3} mt={3}>
                                        <Text fontSize={'11'} color={'#ffffff'}>For HomeVest, you are only able to lock down a property after six months of continous contribution.</Text>
                                    </Box>}
                                </VStack>
                                <VStack mt={7}>
                                    {property.description && <Box mb={4}>
                                        <Box>
                                            <Text style={{ color: '#677585', fontSize: 16, fontWeight: 'bold' }}>Description</Text>
                                        </Box>
                                        <Box>
                                            <Text style={{ color: '#ffffff', fontSize: 12 }}>{property.description}</Text>
                                        </Box>

                                    </Box>}
                                    <Box mb={4}>
                                        <Text style={{ color: '#677585', fontSize: 16, fontWeight: 'bold' }}>Key Features</Text>
                                    </Box>
                                    <VStack>
                                        <Box ><Text style={{ color: '#ffffff' }}>{property.bedrooms} Bedrooms</Text></Box>
                                        {property.features && property.features.map((feature, ind) => {
                                            return (
                                                <Box key={ind}><Text style={{ color: '#ffffff' }}>{feature}</Text></Box>
                                            )
                                        })}
                                    </VStack>
                                </VStack>
                            </Box>
                        </HStack>

                    </Box>
                </View>
            </BottomSheet>
        </>
    );
};


export default PropertyDetailScreen;