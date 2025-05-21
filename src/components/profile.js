import React from 'react';
import { Pressable } from 'react-native';
import { VStack, Box, Image, Text, HStack } from 'native-base';

const Profile = (props) => {
    const onLogout = (navigation) => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen'}],
          });
    }

    const goToHelp = (navigation) => {
        navigation.navigate('FeedbackScreen')
    }

    if(!props.userData || !props.userData.user) {
        return <></>
    }
    
    return (<HStack mb={5} space={1}>
        <HStack w={'1/6'}>
        <Image size={50} borderRadius={100} source={{
    uri: "https://wallpaperaccess.com/full/317501.jpg"
    }} alt={props.userData.user.firstname} />
        </HStack>
        <HStack w={'3/6'}>
            <VStack>
                <Box _text={{color:'#ffffff'}}>Hello,</Box>
<Box _text={{color:'#ffffff', fontWeight: 'bold', fontSize: 18}}>{props.userData.user.firstname}</Box>
            </VStack>
        </HStack>
        <HStack  w={'1/6'}>
            <Pressable onPress={() => {
                if(props.navigation) {
                    goToHelp(props.navigation)
                }
            }}>
            <Text style={{color: '#ffffff'}}>Help</Text>
            </Pressable>
        </HStack>
        <HStack  w={'1/6'}>
            <Pressable onPress={() => {
                if(props.navigation) {
                    onLogout(props.navigation)
                }
            }}>
            <Text style={{color: '#ffffff'}}>Logout</Text>
            </Pressable>
        </HStack>
    </HStack>)
}

export default Profile