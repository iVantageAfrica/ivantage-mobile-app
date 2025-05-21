import { useState } from "react";
import { Box, Button, Heading, Link, Text } from "native-base"
import { View } from "react-native"
import * as WebBrowser from 'expo-web-browser';

import Shared from "../../themes/shared"
import { useAuthentication } from "../../queries/useAuthentication";

import Loader from '../../components/loader'
import AlertBox from '../../components/alertbox';
import themes from "../../themes";


const AffiliateOnboardingScreen = ({ navigation, route }) => {
    const { fetchData: joinAffiliate } = useAuthentication('affiliate_onboarding', 'post', navigation);
    const [loading, setLoading] = useState(false)

    const signUpAsAffiliate = async () => {
        setLoading(true)
        try {
            const resp = await joinAffiliate({})
            setLoading(false)
            if (resp && resp.data && resp.data.success) {
                AlertBox.showSuccess('Your affiliate account has been set up.')
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
                return
            }
            AlertBox.showErrorEx(resp)
            return
        } catch (error) {
            setLoading(false)
        }
        AlertBox.showError('Unable to complete this request. Please try again later.', 'Failed Request')
    }

    const openLink = async () => {
        await WebBrowser.openBrowserAsync('https://www.imperialmortgagebank.com/termsandconditions.html');
    }

    if (loading) {
        return <Loader />
    }

    return (
        <View style={{ margin: 5 }}>
            <Box ml={5} mr={5}>
                <Heading style={{ color: '#ffffff', fontSize: 20 }}>
                    Become An Affiliate
                </Heading>
                <Box>
                    <Text color={'#ffffff'}>
                    We extend a warm welcome to you as you choose to join us on this exciting journey of endless opportunities, where together we will explore the boundless potential of a new world.
                    </Text>
                </Box>
                <Box mt={5} _text={{ color: '#ffffff', }}>
                    Clicking on "Proceed" means you have accepted our terms and conditions for
                    becoming an affiliate as stated in the link below.
                    <Link
                    mt={2}
                    _text={{
                        color: themes.CustomTheme['color-active-button']
                    }}
                    onPress={() => openLink()}
                    >Terms and conditions</Link>
                </Box>
                
            </Box>
            <Box ml={5} mr={5} mt={20}>
                <Button
                    onPress={() => {
                        signUpAsAffiliate()
                    }}
                    style={{ ...Shared.Button.primary, marginVertical: 15 }}
                    variant={'solid'} >Proceed</Button>
                
            </Box>
        </View>
    )
}

export default AffiliateOnboardingScreen