import React from 'react';
import PropertyListingScreen from '../properties/listing';
import Shared from '../../themes/shared';

import { Box, Text, Button, Center } from 'native-base';


const HomeVestPropertyScreen = ({ navigation, route }) => {
    
    const Modes = {
        homevest: 'homevest',
        property_view: 'view'
    }

    const mode = route.params?.mode ?? Modes.homevest
    return (<><Center>
        {!mode || mode === Modes.homevest && <Box>
            <Box marginY={5}>
                <Text fontSize={16} textAlign={'center'}  color={'#ffffff'}>Start your journey to Home Ownership. </Text>
                <Text fontSize={14} textAlign={'center'} color={'#ffffff'}>Select a price range to get started. </Text>
            </Box>
            <Box>
                <Button w={'100%'} variant={'solid'} size={'md'} style={Shared.Button.primary} onPress={() => navigation.navigate('homevest.create')}>Select Price Range</Button>
            </Box>
        </Box>}
        <Box marginTop={10}>
            <Text fontSize={18} fontWeight={'extrabold'} color={'#ffffff'}>Available Properties </Text>
        </Box>
    </Center>
        <PropertyListingScreen isEmbedded={true} navigation={navigation} propertySource={'homevest'} route={route} />
    </>)
}

export default HomeVestPropertyScreen