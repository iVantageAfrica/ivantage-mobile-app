import React from 'react';
import {TouchableOpacity} from 'react-native'
import { VStack, Box, Image, Text, HStack } from 'native-base';
import Theme from '../themes';
import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

const MoreItem = (props) => {
    // Extract props with default values for better readability
    const { 
        imgsrc, 
        imgIcon, 
        title, 
        subtitle, 
        icon = <Icon size={5} color={'gray'} as={FontAwesome} name="chevron-right" />, // Default chevron icon
        onPress 
    } = props;

    return (
        <TouchableOpacity onPress={onPress} style={{ width: '100%' }}>
            <HStack 
                alignItems="center"
                justifyContent="space-between"
                py={3} // Vertical padding
                px={2} // Horizontal padding
                style={{
                    backgroundColor: Theme.Colors.colorWhite, // Light background
                    borderRadius: 10, // Rounded corners
                }}
            >
                {/* Icon Section */}
                <HStack alignItems="center"> 
                    {imgsrc && <Image size={50} borderRadius={100} source={{ uri: imgsrc }} alt="Alternate Text" style={{marginRight: 16}} />}
                    {imgIcon && <Box style={{marginRight: 16}}>{imgIcon}</Box>} 

                    {/* Text Section */}
                    <VStack flex={1}> 
                        {title && <Text fontSize="md" fontWeight="medium" color="#000000">{title}</Text>}
                        {subtitle && <Text fontSize="sm" color="gray">{subtitle}</Text>}
                    </VStack>
                </HStack>

                {/* Right Arrow Icon */}
                <Box>{icon}</Box>

            </HStack>
        </TouchableOpacity>
    );
};

export default MoreItem;