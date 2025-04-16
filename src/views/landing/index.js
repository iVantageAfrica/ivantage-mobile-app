import React from 'react';
import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';
import { Box, VStack, HStack, Button, Heading, Image, Text } from "native-base";
import AppIntroSlider from 'react-native-app-intro-slider';

const RenderItem = ({ item }) => {
    return (
        <Box safeArea justifyContent="center" alignItems="center">
            <Image height="2xl" resizeMode="cover" alt={item.title} source={item.image} />
        </Box>
    );
};

const Landing = ({navigation}) => {
    const slides = [
        {
            key: 's1',
            title: 'Save towards your equity with Imperial+',
            image: Theme.Images.landing1
        },
        {
            key: 's2',
            title: 'Options and Benefits',
            image: Theme.Images.landing2
        },
        {
            key: 's3',
            title: 'Mobile Banking',
            image: Theme.Images.landing3
        },
    ];
    return (
        <VStack safeArea space={3} style={styles.container}>
            <AppIntroSlider
                    style={{paddingTop:50}}
                    data={slides}
                    renderItem={RenderItem}
                    showSkipButton={false}
                    showNextButton={false}
                    showDoneButton={false}
                    dotStyle={{ backgroundColor: Theme.CustomTheme["color-dot"] }}
                    activeDotStyle={{ backgroundColor: Theme.CustomTheme["color-active-dot"], width: 50 }}
                />
            <Box>
                <HStack marginBottom={10} alignItems={'center'} justifyContent={'center'} space={5}>
                    <Box><Button  variant={'solid'} w={150} size={'md'} style={Shared.Button.primary} onPress={() => navigation.navigate('LoginScreen')}>Log In</Button></Box>
                    <Box><Button variant={'solid'} w={150} size={'md'}  style={Shared.Button.default} onPress={() => navigation.navigate('SignUpScreen')}>Sign Up</Button></Box>
                </HStack>
            </Box>
        </VStack>

    );
};


export default Landing;