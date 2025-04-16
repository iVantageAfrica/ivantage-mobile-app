import React, { memo } from 'react';
import { VStack, Box, Image, Text, HStack, Button, Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';
import Currency from './currency'
import Theme from '../themes';

import { FontAwesome } from '@expo/vector-icons';

class Property extends React.PureComponent {

    getState(property) {
        if(property.district && property.state) {
            console.log("property district ", property.district)
            console.log("property state ", property.state);

            return `${property.district}, ${property.state}`
        }
        const {state: states, location: locations} = property

        if (!states?.length || !locations?.length) {
          return "";
        }

        return `${locations[0].name}, ${states[0].name}`
    }

    render() {
        const { onPress, property, likeIcon, isEmbedded = false } = this.props
        if (!property || !property.images) {
            return <></>
        }

        return (<Box shadow={3} w={'1/2'} borderRadius={10} style={{ backgroundColor: '#415367' }}>
            <VStack>
                <TouchableOpacity delayPressIn={0} onPress={onPress}>
                    <Image w={'full'} h={150} borderTopRadius={10} resizeMode={'cover'} source={{
                        uri: property.images[0].url ?? property.images[0]
                    }}
                        fallbackSource={{
                            uri: "https://www.w3schools.com/css/img_lights.jpg"
                        }}
                        alt={property.name ?? property.title} />
                </TouchableOpacity>
                <Box p={1}>
                    <HStack mb={4}>
                        <Box w={'5/6'}>
                            <VStack mb={1}>
                                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: '300', color: Theme.CustomTheme['color-active-text-alt'] }}>{this.getState(property)}</Text>
                                <Text numberOfLines={1} style={{ fontSize: 13, color: '#ffffff', fontWeight: 'bold' }}>{property.name ?? property.title}</Text>
                            </VStack>
                            {!isEmbedded && <VStack>
                                <HStack space={1}>
                                    <Text style={{ fontSize: 13, fontWeight: '300', color: Theme.CustomTheme['color-active-text-alt'] }}>No. of Bedrooms:</Text>
                                    <Text style={{ fontSize: 14, color: '#ffffff', fontWeight: 'bold' }}>{property.bedrooms}</Text>
                                </HStack>
                            </VStack>}
                            {!isEmbedded && <VStack>
                                <Text style={{ fontSize: 13, fontWeight: '300', color: Theme.CustomTheme['color-active-text-alt'] }}>Price</Text>
                                <Currency style={{ fontSize: 14, color: '#ffffff', fontWeight: 'bold' }} value={property.price} />
                            </VStack>}
                        </Box>
                        {!isEmbedded && <Box>
                            {likeIcon}
                        </Box>}
                    </HStack>
                </Box>
            </VStack>
        </Box>)
    }
}


export default memo(Property)