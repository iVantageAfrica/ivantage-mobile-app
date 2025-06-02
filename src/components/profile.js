import { Pressable } from 'react-native';
import { VStack, Box, Image, Text, HStack, Icon, Center } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '../themes/ivantage/colors';

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

    const fullName = `${props.userData.user.firstname ?? ''} ${props.userData.user.lastname ?? ''}`.trim();

    return (
        <HStack mb={5} space={4} alignItems="center" justifyContent="space-between">
            {/* Profile Image */}
            <Center w="16">
                <Image size={10} borderRadius={100} source={{
                    uri: "https://wallpaperaccess.com/full/317501.jpg"
                }} alt={fullName} />
            </Center>
            {/* Welcome and Name */}
            <VStack flex={1} ml={2}>
                <Text fontSize="xl" fontWeight="medium" color={Colors.secondaryText}>Welcome</Text>
                <Text fontSize="xl" fontWeight="bold" color={Colors.secondaryText}>{fullName}</Text>
            </VStack>
            {/* Help and Logout Buttons */}
            <HStack space={3}>
                <Pressable onPress={() => { if(props.navigation) { goToHelp(props.navigation) }}}>
                    <Text style={{color: Colors.secondaryText}}>Help</Text>
                </Pressable>
                <Pressable onPress={() => { if(props.navigation) { onLogout(props.navigation) }}}>
                    <Text style={{color: Colors.secondaryText}}>Logout</Text>
                </Pressable>
            </HStack>
        </HStack>
    )
}

export default Profile