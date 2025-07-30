import React from 'react';
import {TouchableOpacity} from 'react-native'
import { VStack, Box, Image, Text, HStack } from 'native-base';
import Theme from '../themes';
import { Icon } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

const TransferMenuItem = (props) => {
    const { 
        imgsrc, 
        imgIcon, 
        title, 
        subtitle, 
        icon = <Icon size={5} color={'gray'} as={FontAwesome} name="chevron-right" />,
        onPress 
    } = props;

    return (
        <TouchableOpacity
         onPress={onPress} 
         style={{
             width: '90%',
             alignSelf: 'center', 
                marginBottom: 12
              }}>
            <HStack 
                alignItems="center"
                justifyContent="space-between"
                py={1} 
                px={3} 
                style={{
                    backgroundColor: Theme.Colors.colorGrey, 
                    borderRadius: 8, 
                }}
            >
                {/* Icon Section */}
                <HStack alignItems="center"> 
                    {imgsrc && <Image size={30} 
                    borderRadius={80}
                    borderWidth = { isActive ? 2 : 0}
                    borderColor={isActive ? Theme.Colors.primary : Theme.Colors.tertiaryTextColor}
                    source={{ uri: imgsrc }} alt="Alternate Text" 
                    style={{marginRight: 16}} />}
                    {imgIcon && <Box style={{marginRight: 16}}>{imgIcon}</Box>}

                    {/* Text Section */}
                    <VStack> 
                        {title && <Text fontSize="md" fontWeight="medium" color={Theme.Colors.colorBlack}>{title}</Text>}
                        {subtitle && <Text fontSize="sm" color="gray">{subtitle}</Text>}
                    </VStack>
                </HStack>

                {/* Right Arrow Icon */}
                <Box>
                    {icon}
                </Box>

            </HStack>
        </TouchableOpacity>
    );
};

export default TransferMenuItem;